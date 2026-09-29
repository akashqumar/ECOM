package com.ecom.order.service;

import com.ecom.common.event.CloudEvent;
import com.ecom.common.event.EventType;
import com.ecom.order.entity.Order;
import com.ecom.order.entity.OutboxEvent;
import com.ecom.order.entity.SagaInstance;
import com.ecom.order.model.OrderStatus;
import com.ecom.order.repository.OrderRepository;
import com.ecom.order.repository.OutboxEventRepository;
import com.ecom.order.repository.SagaInstanceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class SagaOrchestratorService {

    private static final Logger log = LoggerFactory.getLogger(SagaOrchestratorService.class);

    private final OrderRepository orderRepository;
    private final SagaInstanceRepository sagaInstanceRepository;
    private final OutboxEventRepository outboxEventRepository;

    public SagaOrchestratorService(OrderRepository orderRepository,
                                   SagaInstanceRepository sagaInstanceRepository,
                                   OutboxEventRepository outboxEventRepository) {
        this.orderRepository = orderRepository;
        this.sagaInstanceRepository = sagaInstanceRepository;
        this.outboxEventRepository = outboxEventRepository;
    }

    /**
     * Step 1 Success: Inventory was successfully reserved -> Transition order to INVENTORY_RESERVED,
     * Saga status to IN_PROGRESS, and emit PAYMENT_REQUESTED outbox event.
     */
    @Transactional
    public void onInventoryReserved(String orderId) {
        log.info("Saga Orchestrator: onInventoryReserved for order: {}", orderId);
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            log.error("Order not found: {}", orderId);
            return;
        }

        Order order = orderOpt.get();
        if (order.getStatus().canTransitionTo(OrderStatus.INVENTORY_RESERVED)) {
            order.setStatus(OrderStatus.INVENTORY_RESERVED);
            orderRepository.save(order);
        }

        SagaInstance saga = sagaInstanceRepository.findByOrderId(orderId)
                .orElseGet(() -> new SagaInstance(orderId, "PAYMENT", "IN_PROGRESS"));
        saga.setCurrentStep("PROCESS_PAYMENT");
        saga.setStatus("IN_PROGRESS");
        sagaInstanceRepository.save(saga);

        // Emit PAYMENT_REQUESTED command to Kafka
        Map<String, Object> paymentPayload = new HashMap<>();
        paymentPayload.put("orderId", order.getId());
        paymentPayload.put("orderNumber", order.getOrderNumber());
        paymentPayload.put("userId", order.getUserId());
        paymentPayload.put("amount", order.getTotalAmount());
        paymentPayload.put("currency", order.getCurrency());
        paymentPayload.put("idempotencyKey", order.getIdempotencyKey());

        saveOutboxEvent("ORDER", order.getId(), EventType.PAYMENT_REQUESTED, paymentPayload);
        log.info("Saga Orchestrator: Emitted PAYMENT_REQUESTED for order: {}", orderId);
    }

    /**
     * Step 1 Failure: Inventory reservation failed -> Mark order as FAILED, Saga as FAILED.
     */
    @Transactional
    public void onInventoryReservationFailed(String orderId, String reason) {
        log.warn("Saga Orchestrator: onInventoryReservationFailed for order: {}. Reason: {}", orderId, reason);
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            if (order.getStatus().canTransitionTo(OrderStatus.FAILED)) {
                order.setStatus(OrderStatus.FAILED);
                orderRepository.save(order);
            }
        }

        SagaInstance saga = sagaInstanceRepository.findByOrderId(orderId)
                .orElseGet(() -> new SagaInstance(orderId, "INVENTORY", "FAILED"));
        saga.setCurrentStep("FAILED");
        saga.setStatus("FAILED");
        saga.setErrorMessage(reason);
        sagaInstanceRepository.save(saga);

        // Notify client
        Map<String, Object> failPayload = new HashMap<>();
        failPayload.put("orderId", orderId);
        failPayload.put("reason", reason);
        saveOutboxEvent("ORDER", orderId, EventType.ORDER_CANCELLED, failPayload);
    }

    /**
     * Step 2 Success: Payment completed -> Transition order to PAID, CONFIRMED,
     * Saga status to COMPLETED, and emit ORDER_CONFIRMED (which triggers stock deduction and notification).
     */
    @Transactional
    public void onPaymentCompleted(String orderId, String transactionId) {
        log.info("Saga Orchestrator: onPaymentCompleted for order: {}, transaction: {}", orderId, transactionId);
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            log.error("Order not found: {}", orderId);
            return;
        }

        Order order = orderOpt.get();
        if (order.getStatus().canTransitionTo(OrderStatus.PAID)) {
            order.setStatus(OrderStatus.PAID);
        }
        if (order.getStatus().canTransitionTo(OrderStatus.CONFIRMED)) {
            order.setStatus(OrderStatus.CONFIRMED);
        }
        orderRepository.save(order);

        SagaInstance saga = sagaInstanceRepository.findByOrderId(orderId)
                .orElseGet(() -> new SagaInstance(orderId, "COMPLETED", "COMPLETED"));
        saga.setCurrentStep("COMPLETED");
        saga.setStatus("COMPLETED");
        sagaInstanceRepository.save(saga);

        // Emit ORDER_CONFIRMED event (consumed by Inventory to finalize stock, and Notification)
        Map<String, Object> confirmPayload = new HashMap<>();
        confirmPayload.put("orderId", order.getId());
        confirmPayload.put("orderNumber", order.getOrderNumber());
        confirmPayload.put("userId", order.getUserId());
        confirmPayload.put("transactionId", transactionId);

        saveOutboxEvent("ORDER", order.getId(), EventType.ORDER_CONFIRMED, confirmPayload);
        log.info("Saga Orchestrator: Order confirmed and completed: {}", orderId);
    }

    /**
     * Step 2 Failure: Payment failed -> Start Compensation!
     * 1. Set Saga status to COMPENSATING
     * 2. Emit ORDER_CANCELLED event to tell Inventory to release reserved stock
     */
    @Transactional
    public void onPaymentFailed(String orderId, String reason) {
        log.warn("Saga Orchestrator: onPaymentFailed for order: {}. Triggering Compensation. Reason: {}", orderId, reason);

        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            if (order.getStatus().canTransitionTo(OrderStatus.FAILED)) {
                order.setStatus(OrderStatus.FAILED);
                orderRepository.save(order);
            }
        }

        SagaInstance saga = sagaInstanceRepository.findByOrderId(orderId)
                .orElseGet(() -> new SagaInstance(orderId, "COMPENSATING", "COMPENSATING"));
        saga.setCurrentStep("COMPENSATING_INVENTORY");
        saga.setStatus("COMPENSATING");
        saga.setErrorMessage("Payment failed: " + reason);
        sagaInstanceRepository.save(saga);

        // Emit ORDER_CANCELLED event -> InventoryService listens to this to release stock
        Map<String, Object> compPayload = new HashMap<>();
        compPayload.put("orderId", orderId);
        compPayload.put("reason", "Payment failed: " + reason);

        saveOutboxEvent("ORDER", orderId, EventType.ORDER_CANCELLED, compPayload);
        log.info("Saga Orchestrator: Emitted ORDER_CANCELLED for compensation on order: {}", orderId);
    }

    /**
     * Step 3 Compensation completed: Inventory released stock -> Mark Saga as FAILED
     */
    @Transactional
    public void onInventoryReleased(String orderId) {
        log.info("Saga Orchestrator: onInventoryReleased for order: {}. Compensation complete.", orderId);
        SagaInstance saga = sagaInstanceRepository.findByOrderId(orderId).orElse(null);
        if (saga != null) {
            saga.setCurrentStep("COMPENSATION_COMPLETED");
            saga.setStatus("FAILED");
            sagaInstanceRepository.save(saga);
        }
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
}
