package com.ecom.inventory.listener;

import com.ecom.common.constant.CommonConstants;
import com.ecom.common.event.CloudEvent;
import com.ecom.common.event.EventType;
import com.ecom.inventory.dto.OrderItemRequest;
import com.ecom.inventory.dto.ReserveStockRequest;
import com.ecom.inventory.entity.ProcessedEvent;
import com.ecom.inventory.repository.ProcessedEventRepository;
import com.ecom.inventory.service.InventoryService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Component
public class OrderEventListener {

    private static final Logger log = LoggerFactory.getLogger(OrderEventListener.class);
    private static final String CONSUMER_GROUP = "inventory-order-group";
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final InventoryService inventoryService;
    private final ProcessedEventRepository processedEventRepository;

    public OrderEventListener(InventoryService inventoryService,
                              ProcessedEventRepository processedEventRepository) {
        this.inventoryService = inventoryService;
        this.processedEventRepository = processedEventRepository;
    }

    @KafkaListener(topics = CommonConstants.TOPIC_ORDER_EVENTS, groupId = CONSUMER_GROUP)
    @Transactional
    public void handleOrderEvent(String message) {
        try {
            JsonNode root = objectMapper.readTree(message);
            if (root.isTextual()) {
                root = objectMapper.readTree(root.asText());
            }
            String eventId = root.path("eventId").asText();
            String eventTypeStr = root.path("eventType").asText();

            // 1. Idempotency Check: deduplicate using processed_events table
            if (processedEventRepository.existsById(eventId)) {
                log.info("Duplicate event ignored: {}", eventId);
                return;
            }

            EventType eventType = EventType.valueOf(eventTypeStr);
            JsonNode payload = root.path("payload");
            String orderId = root.path("aggregateId").asText();

            switch (eventType) {
                case ORDER_CREATED -> {
                    List<OrderItemRequest> items = new ArrayList<>();
                    JsonNode itemsNode = payload.path("items");
                    if (itemsNode.isArray()) {
                        for (JsonNode itemNode : itemsNode) {
                            items.add(new OrderItemRequest(
                                    itemNode.path("productId").asText(),
                                    itemNode.path("quantity").asInt()
                            ));
                        }
                    }
                    inventoryService.reserveStock(new ReserveStockRequest(orderId, items));
                }
                case ORDER_CONFIRMED -> inventoryService.confirmStock(orderId);
                case ORDER_CANCELLED -> inventoryService.releaseStock(orderId);
                default -> log.debug("Ignored event type: {}", eventType);
            }

            // 2. Mark event as processed in the same transaction
            processedEventRepository.save(new ProcessedEvent(eventId, CONSUMER_GROUP));

        } catch (Exception ex) {
            log.error("Error processing order event message: {}", message, ex);
            // Re-throw to trigger Kafka retry / DLT routing
            throw new RuntimeException("Failed to process order event", ex);
        }
    }
}
