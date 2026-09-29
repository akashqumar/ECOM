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
public class PaymentReplyListener {

    private static final Logger log = LoggerFactory.getLogger(PaymentReplyListener.class);
    private static final String CONSUMER_GROUP = "order-payment-reply-group";
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final SagaOrchestratorService sagaOrchestratorService;
    private final ProcessedEventRepository processedEventRepository;

    public PaymentReplyListener(SagaOrchestratorService sagaOrchestratorService,
                                ProcessedEventRepository processedEventRepository) {
        this.sagaOrchestratorService = sagaOrchestratorService;
        this.processedEventRepository = processedEventRepository;
    }

    @KafkaListener(topics = CommonConstants.TOPIC_PAYMENT_EVENTS, groupId = CONSUMER_GROUP)
    @Transactional
    public void handlePaymentReply(String message) {
        try {
            JsonNode root = objectMapper.readTree(message);
            String eventId = root.path("eventId").asText();
            String eventTypeStr = root.path("eventType").asText();

            // Deduplication
            if (processedEventRepository.existsById(eventId)) {
                log.info("Duplicate payment reply event ignored: {}", eventId);
                return;
            }

            EventType eventType = EventType.valueOf(eventTypeStr);
            String orderId = root.path("aggregateId").asText();
            JsonNode payload = root.path("payload");

            switch (eventType) {
                case PAYMENT_COMPLETED -> {
                    String transactionId = payload.has("transactionId") ? payload.path("transactionId").asText() : "";
                    log.info("Received PAYMENT_COMPLETED for order: {}, txn: {}", orderId, transactionId);
                    sagaOrchestratorService.onPaymentCompleted(orderId, transactionId);
                }
                case PAYMENT_FAILED -> {
                    String reason = payload.has("reason") ? payload.path("reason").asText() : "Payment declined";
                    log.warn("Received PAYMENT_FAILED for order: {}, reason: {}", orderId, reason);
                    sagaOrchestratorService.onPaymentFailed(orderId, reason);
                }
                default -> log.debug("Ignored payment event: {}", eventType);
            }

            processedEventRepository.save(new ProcessedEvent(eventId, CONSUMER_GROUP));
        } catch (Exception ex) {
            log.error("Error processing payment event reply: {}", message, ex);
            throw new RuntimeException("Failed to process payment reply", ex);
        }
    }
}
