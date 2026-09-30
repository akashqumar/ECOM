package com.ecom.order.service;

import com.ecom.common.constant.CommonConstants;
import com.ecom.common.event.CloudEvent;
import com.ecom.common.event.EventType;
import com.ecom.common.exception.ResourceNotFoundException;
import com.ecom.order.dto.*;
import com.ecom.order.entity.Order;
import com.ecom.order.entity.OrderItem;
import com.ecom.order.entity.OutboxEvent;
import com.ecom.order.entity.SagaInstance;
import com.ecom.order.model.OrderStatus;
import com.ecom.order.repository.OrderItemRepository;
import com.ecom.order.repository.OrderRepository;
import com.ecom.order.repository.OutboxEventRepository;
import com.ecom.order.repository.SagaInstanceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final SagaInstanceRepository sagaInstanceRepository;
    private final OutboxEventRepository outboxEventRepository;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        SagaInstanceRepository sagaInstanceRepository,
                        OutboxEventRepository outboxEventRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.sagaInstanceRepository = sagaInstanceRepository;
        this.outboxEventRepository = outboxEventRepository;
    }

    @Transactional
    public CheckoutResponse createOrder(String userId, CheckoutRequest request) {
        log.info("Processing checkout for user: {}, idempotencyKey: {}", userId, request.getIdempotencyKey());

        // 1. Idempotency Check: User + IdempotencyKey
        Optional<Order> existingOrderOpt = orderRepository.findByUserIdAndIdempotencyKey(userId, request.getIdempotencyKey());
        if (existingOrderOpt.isPresent()) {
            Order existingOrder = existingOrderOpt.get();
            log.info("Idempotent request matched existing order: {}", existingOrder.getId());
            SagaInstance saga = sagaInstanceRepository.findByOrderId(existingOrder.getId()).orElse(null);
            String sagaStatus = saga != null ? saga.getStatus() : "UNKNOWN";
            return new CheckoutResponse(
                    existingOrder.getId(),
                    existingOrder.getOrderNumber(),
                    existingOrder.getStatus().name(),
                    existingOrder.getTotalAmount(),
                    existingOrder.getCurrency(),
                    sagaStatus,
                    "Order retrieved from idempotent key",
                    existingOrder.getCreatedAt()
            );
        }

        // 2. Build Order & Items
        Order order = new Order(userId, request.getIdempotencyKey(), request.getShippingAddress());
        order.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        order.setDiscount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO);
        order.setTax(request.getTax() != null ? request.getTax() : BigDecimal.ZERO);
        order.setShippingFee(request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO);

        BigDecimal subtotal = BigDecimal.ZERO;
        List<Map<String, Object>> itemEventPayloads = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            OrderItem item = new OrderItem(
                    itemReq.getProductId(),
                    itemReq.getProductName(),
                    itemReq.getSku(),
                    itemReq.getUnitPrice(),
                    itemReq.getQuantity()
            );
            order.addItem(item);
            subtotal = subtotal.add(item.getSubtotal());

            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("productId", itemReq.getProductId());
            itemMap.put("productName", itemReq.getProductName());
            itemMap.put("sku", itemReq.getSku());
            itemMap.put("quantity", itemReq.getQuantity());
            itemMap.put("unitPrice", itemReq.getUnitPrice());
            itemEventPayloads.add(itemMap);
        }

        order.setSubtotal(subtotal);
        BigDecimal total = subtotal.subtract(order.getDiscount()).add(order.getTax()).add(order.getShippingFee());
        order.setTotalAmount(total.max(BigDecimal.ZERO));

        Order savedOrder = orderRepository.save(order);

        // 3. Initialize Saga Instance
        SagaInstance saga = new SagaInstance(savedOrder.getId(), "RESERVE_INVENTORY", "STARTED");
        sagaInstanceRepository.save(saga);

        // 4. Save Outbox Event (ORDER_CREATED) for Inventory Service to reserve stock
        Map<String, Object> payloadMap = new HashMap<>();
        payloadMap.put("orderId", savedOrder.getId());
        payloadMap.put("orderNumber", savedOrder.getOrderNumber());
        payloadMap.put("userId", savedOrder.getUserId());
        payloadMap.put("totalAmount", savedOrder.getTotalAmount());
        payloadMap.put("currency", savedOrder.getCurrency());
        payloadMap.put("items", itemEventPayloads);

        saveOutboxEvent("ORDER", savedOrder.getId(), EventType.ORDER_CREATED, payloadMap);

        log.info("Order created successfully: {} with Saga instance: {}", savedOrder.getId(), saga.getId());

        return new CheckoutResponse(
                savedOrder.getId(),
                savedOrder.getOrderNumber(),
                savedOrder.getStatus().name(),
                savedOrder.getTotalAmount(),
                savedOrder.getCurrency(),
                saga.getStatus(),
                "Checkout initialized successfully",
                savedOrder.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return toDto(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByUserId(String userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable).map(this::toDto);
    }

    @Transactional
    public OrderResponse cancelOrder(String orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getStatus().canTransitionTo(OrderStatus.CANCELLED)) {
            throw new IllegalStateException("Cannot cancel order in status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // Trigger compensation event
        Map<String, Object> payload = new HashMap<>();
        payload.put("orderId", order.getId());
        payload.put("reason", reason);

        saveOutboxEvent("ORDER", order.getId(), EventType.ORDER_CANCELLED, payload);

        // Update saga instance if exists
        sagaInstanceRepository.findByOrderId(orderId).ifPresent(saga -> {
            saga.setStatus("FAILED");
            saga.setErrorMessage("Cancelled: " + reason);
            sagaInstanceRepository.save(saga);
        });

        return toDto(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::toDto);
    }

    @Transactional
    public OrderResponse updateOrderStatus(String orderId, String statusStr, String trackingNumber, String carrier, String notes) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid order status: " + statusStr);
        }

        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);

        // Emit outbox events for relevant status changes
        Map<String, Object> payload = new HashMap<>();
        payload.put("orderId", savedOrder.getId());
        payload.put("orderNumber", savedOrder.getOrderNumber());
        payload.put("userId", savedOrder.getUserId());
        payload.put("status", newStatus.name());
        if (trackingNumber != null) payload.put("trackingNumber", trackingNumber);
        if (carrier != null) payload.put("carrier", carrier);
        if (notes != null) payload.put("notes", notes);

        if (newStatus == OrderStatus.SHIPPED) {
            saveOutboxEvent("ORDER", savedOrder.getId(), EventType.ORDER_SHIPPED, payload);
        } else if (newStatus == OrderStatus.DELIVERED) {
            saveOutboxEvent("ORDER", savedOrder.getId(), EventType.ORDER_DELIVERED, payload);
        } else if (newStatus == OrderStatus.CANCELLED) {
            saveOutboxEvent("ORDER", savedOrder.getId(), EventType.ORDER_CANCELLED, payload);
        }

        log.info("Admin updated order {} status to {}", orderId, newStatus);
        return toDto(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderTimelineResponse getOrderTimeline(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        SagaInstance saga = sagaInstanceRepository.findByOrderId(orderId).orElse(null);

        List<OrderTimelineResponse.TimelineEventDto> timeline = new ArrayList<>();
        timeline.add(new OrderTimelineResponse.TimelineEventDto(
                "ORDER_CREATED",
                "Order Created",
                "Order #" + order.getOrderNumber() + " submitted",
                order.getCreatedAt(),
                "COMPLETED"
        ));

        if (order.getStatus() == OrderStatus.INVENTORY_RESERVED ||
            order.getStatus() == OrderStatus.PAYMENT_PENDING ||
            order.getStatus() == OrderStatus.PAID ||
            order.getStatus() == OrderStatus.CONFIRMED ||
            order.getStatus() == OrderStatus.PROCESSING ||
            order.getStatus() == OrderStatus.SHIPPED ||
            order.getStatus() == OrderStatus.DELIVERED) {
            timeline.add(new OrderTimelineResponse.TimelineEventDto(
                    "INVENTORY_RESERVED",
                    "Inventory Reserved",
                    "Items allocated from warehouse",
                    order.getUpdatedAt(),
                    "COMPLETED"
            ));
        }

        if (order.getStatus() == OrderStatus.PAID ||
            order.getStatus() == OrderStatus.CONFIRMED ||
            order.getStatus() == OrderStatus.PROCESSING ||
            order.getStatus() == OrderStatus.SHIPPED ||
            order.getStatus() == OrderStatus.DELIVERED) {
            timeline.add(new OrderTimelineResponse.TimelineEventDto(
                    "PAYMENT_COMPLETED",
                    "Payment Successful",
                    "Payment charged: " + order.getCurrency() + " " + order.getTotalAmount(),
                    order.getUpdatedAt(),
                    "COMPLETED"
            ));
            timeline.add(new OrderTimelineResponse.TimelineEventDto(
                    "ORDER_CONFIRMED",
                    "Order Confirmed",
                    "Order verified and sent to fulfillment",
                    order.getUpdatedAt(),
                    "COMPLETED"
            ));
        }

        if (order.getStatus() == OrderStatus.PROCESSING ||
            order.getStatus() == OrderStatus.SHIPPED ||
            order.getStatus() == OrderStatus.DELIVERED) {
            timeline.add(new OrderTimelineResponse.TimelineEventDto(
                    "ORDER_PROCESSING",
                    "Order in Processing",
                    "Fulfillment team is preparing package",
                    order.getUpdatedAt(),
                    "COMPLETED"
            ));
        }

        if (order.getStatus() == OrderStatus.SHIPPED ||
            order.getStatus() == OrderStatus.DELIVERED) {
            timeline.add(new OrderTimelineResponse.TimelineEventDto(
                    "ORDER_SHIPPED",
                    "Order Shipped",
                    "Package dispatched with delivery carrier",
                    order.getUpdatedAt(),
                    "COMPLETED"
            ));
        }

        if (order.getStatus() == OrderStatus.DELIVERED) {
            timeline.add(new OrderTimelineResponse.TimelineEventDto(
                    "ORDER_DELIVERED",
                    "Order Delivered",
                    "Package successfully delivered to customer",
                    order.getUpdatedAt(),
                    "COMPLETED"
            ));
        } else if (order.getStatus() == OrderStatus.FAILED || order.getStatus() == OrderStatus.CANCELLED) {
            timeline.add(new OrderTimelineResponse.TimelineEventDto(
                    "ORDER_FAILED",
                    "Order Cancelled / Failed",
                    saga != null && saga.getErrorMessage() != null ? saga.getErrorMessage() : "Order could not be fulfilled",
                    order.getUpdatedAt(),
                    "FAILED"
            ));
        }

        return new OrderTimelineResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getStatus().name(),
                saga != null ? saga.getStatus() : "UNKNOWN",
                saga != null ? saga.getCurrentStep() : "NONE",
                saga != null ? saga.getErrorMessage() : null,
                timeline
        );
    }

    private void saveOutboxEvent(String aggregateType, String aggregateId, EventType eventType, Object payload) {
        CloudEvent<Object> cloudEvent = CloudEvent.of(
                eventType,
                aggregateType,
                aggregateId,
                null,
                null,
                "order-service",
                payload
        );
        String payloadJson = com.ecom.common.util.JsonUtils.toJson(cloudEvent);
        OutboxEvent outboxEvent = new OutboxEvent(aggregateType, aggregateId, eventType.name(), payloadJson);
        outboxEventRepository.save(outboxEvent);
    }

    private OrderResponse toDto(Order order) {
        List<OrderItemResponse> itemDtos = order.getItems().stream()
                .map(i -> new OrderItemResponse(
                        i.getId(),
                        i.getProductId(),
                        i.getProductNameSnapshot(),
                        i.getSkuSnapshot(),
                        i.getPriceSnapshot(),
                        i.getQuantity(),
                        i.getSubtotal()
                ))
                .collect(Collectors.toList());

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getUserId(),
                order.getStatus(),
                order.getSubtotal(),
                order.getDiscount(),
                order.getTax(),
                order.getShippingFee(),
                order.getTotalAmount(),
                order.getCurrency(),
                order.getShippingAddressSnapshot(),
                itemDtos,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
