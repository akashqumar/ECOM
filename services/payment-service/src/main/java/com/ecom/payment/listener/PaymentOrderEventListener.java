package com.ecom.payment.listener;

import com.ecom.common.constant.CommonConstants;
import com.ecom.common.event.EventType;
import com.ecom.payment.entity.ProcessedEvent;
import com.ecom.payment.repository.ProcessedEventRepository;
import com.ecom.payment.service.PaymentService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
public class PaymentOrderEventListener {

    private static final Logger log = LoggerFactory.getLogger(PaymentOrderEventListener.class);
    private static final String CONSUMER_GROUP = "payment-order-events-group";
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final PaymentService paymentService;
    private final ProcessedEventRepository processedEventRepository;

    public PaymentOrderEventListener(PaymentService paymentService,
                                     ProcessedEventRepository processedEventRepository) {
        this.paymentService = paymentService;
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

            if (processedEventRepository.existsById(eventId)) {
                log.info("Duplicate order event ignored in payment-service: {}", eventId);
                return;
            }

            EventType eventType = EventType.valueOf(eventTypeStr);
            JsonNode payload = root.path("payload");

            if (eventType == EventType.PAYMENT_REQUESTED) {
                String orderId = payload.path("orderId").asText();
                String userId = payload.path("userId").asText();
                BigDecimal amount = new BigDecimal(payload.path("amount").asText());
                String currency = payload.has("currency") ? payload.path("currency").asText() : "USD";
                String idempotencyKey = payload.has("idempotencyKey") ? payload.path("idempotencyKey").asText() : orderId;

                log.info("Processing PAYMENT_REQUESTED for orderId={}", orderId);
                paymentService.processPayment(orderId, userId, amount, currency, idempotencyKey);
            }

            processedEventRepository.save(new ProcessedEvent(eventId, CONSUMER_GROUP));
        } catch (Exception ex) {
            log.error("Error processing order event in payment service: {}", message, ex);
            throw new RuntimeException("Failed to process order event in payment service", ex);
        }
    }
}
