package com.ecom.order.publisher;

import com.ecom.common.constant.CommonConstants;
import com.ecom.order.entity.OutboxEvent;
import com.ecom.order.repository.OutboxEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Component
@EnableScheduling
public class OrderOutboxPublisher {

    private static final Logger log = LoggerFactory.getLogger(OrderOutboxPublisher.class);
    private static final int BATCH_SIZE = 50;

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public OrderOutboxPublisher(OutboxEventRepository outboxEventRepository,
                                KafkaTemplate<String, String> kafkaTemplate) {
        this.outboxEventRepository = outboxEventRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Scheduled(fixedDelay = 500)
    @Transactional
    public void publishPendingEvents() {
        List<OutboxEvent> pendingEvents = outboxEventRepository.findPendingEventsForUpdate(BATCH_SIZE);
        if (pendingEvents.isEmpty()) {
            return;
        }

        for (OutboxEvent event : pendingEvents) {
            try {
                String topic = resolveTopic(event.getEventType());
                kafkaTemplate.send(topic, event.getAggregateId(), event.getPayload()).get();

                event.setStatus("PUBLISHED");
                event.setPublishedAt(Instant.now());
                outboxEventRepository.save(event);

                log.debug("Successfully published outbox event: {} to topic: {}", event.getId(), topic);
            } catch (Exception ex) {
                log.error("Failed to publish outbox event: {}", event.getId(), ex);
                event.setRetryCount(event.getRetryCount() + 1);
                if (event.getRetryCount() >= 5) {
                    event.setStatus("FAILED");
                }
                outboxEventRepository.save(event);
            }
        }
    }

    private String resolveTopic(String eventType) {
        if (eventType.startsWith("INVENTORY_") || eventType.equals("INVENTORY_RELEASE_REQUESTED")) {
            return CommonConstants.TOPIC_ORDER_EVENTS; // Order events trigger inventory actions
        }
        if (eventType.startsWith("PAYMENT_REQUESTED") || eventType.startsWith("PAYMENT_")) {
            return CommonConstants.TOPIC_ORDER_EVENTS; // Or order.events triggers payment
        }
        if (eventType.startsWith("NOTIFICATION_")) {
            return CommonConstants.TOPIC_NOTIFICATION_EVENTS;
        }
        return CommonConstants.TOPIC_ORDER_EVENTS;
    }
}
