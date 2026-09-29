package com.ecom.payment.publisher;

import com.ecom.common.constant.CommonConstants;
import com.ecom.payment.entity.OutboxEvent;
import com.ecom.payment.repository.OutboxEventRepository;
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
public class PaymentOutboxPublisher {

    private static final Logger log = LoggerFactory.getLogger(PaymentOutboxPublisher.class);
    private static final int BATCH_SIZE = 50;

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public PaymentOutboxPublisher(OutboxEventRepository outboxEventRepository,
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
                String topic = CommonConstants.TOPIC_PAYMENT_EVENTS;
                kafkaTemplate.send(topic, event.getAggregateId(), event.getPayload()).get();

                event.setStatus("PUBLISHED");
                event.setPublishedAt(Instant.now());
                outboxEventRepository.save(event);

                log.debug("Successfully published payment outbox event: {} to topic: {}", event.getId(), topic);
            } catch (Exception ex) {
                log.error("Failed to publish payment outbox event: {}", event.getId(), ex);
                event.setRetryCount(event.getRetryCount() + 1);
                if (event.getRetryCount() >= 5) {
                    event.setStatus("FAILED");
                }
                outboxEventRepository.save(event);
            }
        }
    }
}
