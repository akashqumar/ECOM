# Transactional Outbox Pattern Specification

## 1. Problem Formulation: The Dual-Write Hazard

In microservices, state mutations and event publishing frequently co-occur:
```java
@Transactional
public void createOrder(Order order) {
    orderRepository.save(order); // 1. Writes to PostgreSQL
    kafkaTemplate.send("order.events", new OrderCreatedEvent(order)); // 2. Network I/O to Kafka
}
```

This snippet contains a critical distributed systems flaw:
1. If the database commit succeeds but the network to Kafka drops or times out, the event is permanently lost, causing downstream services (Inventory, Payment) to never act.
2. If the event is sent before the database commits and the database commit fails (due to constraint violation or power loss), a phantom event was broadcast that references an order that does not exist.

---

## 2. Solution: Transactional Outbox Pattern

The Transactional Outbox pattern guarantees that database state updates and event publishing occur atomically within the same local ACID transaction.

### Outbox Table Schema
```sql
CREATE TABLE outbox_events (
    id VARCHAR(36) PRIMARY KEY,
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_outbox_pending ON outbox_events(status, created_at) 
WHERE status = 'PENDING';
```

---

## 3. Outbox Publisher Worker Engine

A resilient background poller runs within each microservice using Spring `@Scheduled`:

```java
@Scheduled(fixedDelay = 500)
@Transactional
public void publishPendingEvents() {
    List<OutboxEvent> events = outboxRepository.findTop50ByStatusOrderByCreatedAtAsc("PENDING");
    for (OutboxEvent event : events) {
        try {
            kafkaTemplate.send(resolveTopic(event), event.getAggregateId(), event.getPayload()).get(2, TimeUnit.SECONDS);
            event.setStatus("PUBLISHED");
            event.setPublishedAt(Instant.now());
        } catch (Exception ex) {
            event.setRetryCount(event.getRetryCount() + 1);
            if (event.getRetryCount() > 5) {
                event.setStatus("FAILED");
            }
        }
    }
}
```

### Advanced Considerations
- **Concurrency & Skip Locked**: In multi-instance deployments, use `SELECT ... FOR UPDATE SKIP LOCKED` to allow multiple service replicas to poll the outbox concurrently without race conditions or duplicated lock waits.
- **At-Least-Once Delivery**: The outbox worker guarantees at-least-once delivery. If the worker publishes an event to Kafka but crashes before marking the outbox row as `PUBLISHED`, the recovered worker will republish the event. This is why every consumer implements idempotent deduplication using `processed_events`.
