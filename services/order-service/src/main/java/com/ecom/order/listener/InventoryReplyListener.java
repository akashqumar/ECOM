package com.ecom.order.listener;

import com.ecom.common.constant.CommonConstants;
import com.ecom.common.event.EventType;
import com.ecom.order.entity.ProcessedEvent;
import com.ecom.order.repository.ProcessedEventRepository;
import com.ecom.order.service.SagaOrchestratorService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class InventoryReplyListener {

    private static final Logger log = LoggerFactory.getLogger(InventoryReplyListener.class);
    private static final String CONSUMER_GROUP = "order-inventory-reply-group";
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final SagaOrchestratorService sagaOrchestratorService;
    private final ProcessedEventRepository processedEventRepository;

    public InventoryReplyListener(SagaOrchestratorService sagaOrchestratorService,
                                  ProcessedEventRepository processedEventRepository) {
        this.sagaOrchestratorService = sagaOrchestratorService;
        this.processedEventRepository = processedEventRepository;
    }

    @KafkaListener(topics = CommonConstants.TOPIC_INVENTORY_EVENTS, groupId = CONSUMER_GROUP)
    @Transactional
    public void handleInventoryReply(String message) {
        try {
            JsonNode root = objectMapper.readTree(message);
            String eventId = root.path("eventId").asText();
            String eventTypeStr = root.path("eventType").asText();

            // Deduplication
            if (processedEventRepository.existsById(eventId)) {
                log.info("Duplicate inventory reply event ignored: {}", eventId);
                return;
            }

            EventType eventType = EventType.valueOf(eventTypeStr);
            String orderId = root.path("aggregateId").asText();
            JsonNode payload = root.path("payload");

            switch (eventType) {
                case INVENTORY_RESERVED -> {
                    log.info("Received INVENTORY_RESERVED for order: {}", orderId);
                    sagaOrchestratorService.onInventoryReserved(orderId);
                }
                case INVENTORY_RESERVATION_FAILED -> {
                    String reason = payload.has("message") ? payload.path("message").asText() : "Inventory reservation failed";
                    log.warn("Received INVENTORY_RESERVATION_FAILED for order: {}, reason: {}", orderId, reason);
                    sagaOrchestratorService.onInventoryReservationFailed(orderId, reason);
                }
                case INVENTORY_RELEASED -> {
                    log.info("Received INVENTORY_RELEASED for order: {}", orderId);
                    sagaOrchestratorService.onInventoryReleased(orderId);
                }
                default -> log.debug("Ignored inventory event: {}", eventType);
            }

            processedEventRepository.save(new ProcessedEvent(eventId, CONSUMER_GROUP));
        } catch (Exception ex) {
            log.error("Error processing inventory event reply: {}", message, ex);
            throw new RuntimeException("Failed to process inventory reply", ex);
        }
    }
}
