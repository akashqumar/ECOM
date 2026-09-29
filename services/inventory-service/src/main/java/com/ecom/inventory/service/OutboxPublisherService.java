package com.ecom.inventory.service;

import com.ecom.common.constant.CommonConstants;
import com.ecom.inventory.entity.OutboxEvent;
import com.ecom.inventory.repository.OutboxEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@EnableScheduling
public class OutboxPublisherService {

    private static final Logger log = LoggerFactory.getLogger(OutboxPublisherService.class);

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public OutboxPublisherService(OutboxEventRepository outboxEventRepository,
                                  KafkaTemplate<String, String> kafkaTemplate) {
        this.outboxEventRepository = outboxEventRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Scheduled(fixedDelay = 500)
    @Transactional
    public void publishPendingOutboxEvents() {
        List<OutboxEvent> pendingEvents = outboxEventRepository.findPendingEventsForPublishing();
        if (pendingEvents.isEmpty()) {
            return;
        }

        for (OutboxEvent event : pendingEvents) {
            try {
                // Key = aggregateId (guarantees partition ordering per order/product)
                kafkaTemplate.send(CommonConstants.TOPIC_INVENTORY_EVENTS, event.getAggregateId(), event.getPayload())
                        .get(3, TimeUnit.SECONDS);

                event.setStatus("PUBLISHED");
                event.setPublishedAt(Instant.now());
                outboxEventRepository.save(event);
            } catch (Exception ex) {
                log.error("Failed to publish outbox event id: {} to Kafka", event.getId(), ex);
                event.setRetryCount(event.getRetryCount() + 1);
                if (event.getRetryCount() >= 5) {
                    event.setStatus("FAILED");
                }
                outboxEventRepository.save(event);
            }
        }
    }
}
