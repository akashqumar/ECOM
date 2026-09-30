package com.ecom.notification.listener;

import com.ecom.common.constant.CommonConstants;
import com.ecom.common.event.EventType;
import com.ecom.notification.entity.ProcessedEvent;
import com.ecom.notification.repository.ProcessedEventRepository;
import com.ecom.notification.service.NotificationService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);
    private static final String CONSUMER_GROUP = "notification-consumer-group";
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final NotificationService notificationService;
    private final ProcessedEventRepository processedEventRepository;

    public NotificationEventListener(NotificationService notificationService,
                                     ProcessedEventRepository processedEventRepository) {
        this.notificationService = notificationService;
        this.processedEventRepository = processedEventRepository;
    }

    @KafkaListener(topics = {CommonConstants.TOPIC_ORDER_EVENTS, CommonConstants.TOPIC_NOTIFICATION_EVENTS}, groupId = CONSUMER_GROUP)
    @Transactional
    public void handleNotificationEvents(String message) {
        try {
            JsonNode root = objectMapper.readTree(message);
            if (root.isTextual()) {
                root = objectMapper.readTree(root.asText());
            }
            String eventId = root.path("eventId").asText();
            String eventTypeStr = root.path("eventType").asText();

            if (processedEventRepository.existsById(eventId)) {
                log.info("Duplicate event ignored in notification service: {}", eventId);
                return;
            }

            EventType eventType = EventType.valueOf(eventTypeStr);
            JsonNode payload = root.path("payload");
            String orderId = root.path("aggregateId").asText();

            switch (eventType) {
                case ORDER_CONFIRMED -> {
                    String userId = payload.has("userId") ? payload.path("userId").asText() : "user-demo";
                    String orderNumber = payload.has("orderNumber") ? payload.path("orderNumber").asText() : orderId;
                    notificationService.createNotification(
                            userId,
                            orderId,
                            "EMAIL",
                            "Order Confirmed: " + orderNumber,
                            "Thank you! Your order " + orderNumber + " has been successfully confirmed and is being processed."
                    );
                }
                case ORDER_CANCELLED -> {
                    String userId = payload.has("userId") ? payload.path("userId").asText() : "user-demo";
                    String reason = payload.has("reason") ? payload.path("reason").asText() : "Order cancelled";
                    notificationService.createNotification(
                            userId,
                            orderId,
                            "EMAIL",
                            "Order Cancelled",
                            "Your order could not be completed and has been cancelled. Reason: " + reason
                    );
                }
                case ORDER_SHIPPED -> {
                    String userId = payload.has("userId") ? payload.path("userId").asText() : "user-demo";
                    String orderNumber = payload.has("orderNumber") ? payload.path("orderNumber").asText() : orderId;
                    String tracking = payload.has("trackingNumber") ? payload.path("trackingNumber").asText() : "TRK-" + System.currentTimeMillis();
                    String carrier = payload.has("carrier") ? payload.path("carrier").asText() : "Express Logistics";
                    notificationService.createNotification(
                            userId,
                            orderId,
                            "EMAIL",
                            "Order Shipped: " + orderNumber,
                            "Good news! Your order #" + orderNumber + " has been shipped via " + carrier + " (Tracking #: " + tracking + "). Track progress in your account."
                    );
                }
                case ORDER_DELIVERED -> {
                    String userId = payload.has("userId") ? payload.path("userId").asText() : "user-demo";
                    String orderNumber = payload.has("orderNumber") ? payload.path("orderNumber").asText() : orderId;
                    notificationService.createNotification(
                            userId,
                            orderId,
                            "EMAIL",
                            "Order Delivered: " + orderNumber,
                            "Your order #" + orderNumber + " has been successfully delivered. Thank you for shopping with AuraCommerce!"
                    );
                }
                default -> log.debug("Notification service ignoring event: {}", eventType);
            }

            processedEventRepository.save(new ProcessedEvent(eventId, CONSUMER_GROUP));
        } catch (Exception ex) {
            log.error("Error processing event in notification service: {}", message, ex);
            throw new RuntimeException("Failed to process event in notification service", ex);
        }
    }
}
