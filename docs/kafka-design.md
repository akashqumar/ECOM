# Kafka Event Architecture & Messaging Specification

## 1. Core Principles

Apache Kafka serves as the distributed asynchronous backbone across all microservices. Every event carries domain intent, context lineage, and schema versioning.

### Delivery Semantics
- **Producer**: At-least-once (`acks=all`, `enable.idempotence=true`, `retries=Integer.MAX_VALUE`).
- **Consumer**: Idempotent processing with manual acknowledgement (`AckMode.MANUAL_IMMEDIATE`) after successful local transaction commit.
- **Deduplication**: Backed by a `processed_events` table in every consuming service's database.

---

## 2. Event Envelope Structure

Every Kafka message adheres to a structured CloudEvents-compliant payload:

```json
{
  "eventId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "eventType": "ORDER_CREATED",
  "aggregateType": "ORDER",
  "aggregateId": "ord-87192",
  "correlationId": "corr-39102-4820",
  "causationId": "req-91023-4819",
  "timestamp": "2026-09-29T18:10:00.123Z",
  "schemaVersion": 1,
  "producer": "order-service",
  "payload": { ... }
}
```

### Metadata Semantics
- **`eventId`**: Universally unique identifier (UUID v4) for the specific message. Used by consumers to deduplicate in `processed_events`.
- **`eventType`**: Identifies the business occurrence (`ORDER_CREATED`, `INVENTORY_RESERVED`, `PAYMENT_COMPLETED`, `PAYMENT_FAILED`, `ORDER_CANCELLED`).
- **`aggregateType` & `aggregateId`**: The DDD domain root. `aggregateId` is utilized as the Kafka Message Key to guarantee partition-level ordering.
- **`correlationId`**: Propagated from the original user request across all downstream services and events for end-to-end distributed tracing.
- **`causationId`**: The ID of the specific event or command that triggered this event.

---

## 3. Topic Topology & Partitioning

```
               +-------------------------------------------------+
               |                   Kafka Cluster                 |
               +-------------------------------------------------+
                                      |
     +-----------------+--------------+---------------+-----------------+
     |                 |                              |                 |
     v                 v                              v                 v
[order.events]  [inventory.events]             [payment.events]  [notification.events]
  (6 parts)         (6 parts)                      (6 parts)         (3 parts)
     |                 |                              |                 |
     |                 |                              |                 |
     v                 v                              v                 v
[order.events.DLT] [inventory.events.DLT]     [payment.events.DLT]      |
```

### Partition Key Strategy
- For `order.events`: Key = `orderId`. Guarantees `ORDER_CREATED`, `ORDER_CONFIRMED`, `ORDER_CANCELLED` are consumed in exact sequential order by any consumer group.
- For `inventory.events`: Key = `orderId` (for reservation callbacks) or `productId` (for stock adjustments).
- For `payment.events`: Key = `orderId`.

---

## 4. Consumer Groups Matrix

| Topic | Consumer Group ID | Consuming Service | Business Action |
| :--- | :--- | :--- | :--- |
| `order.events` | `inventory-order-group` | Inventory Service | Trigger stock reservation upon `ORDER_CREATED` |
| `order.events` | `notification-order-group` | Notification Service | Dispatch order confirmation email on `ORDER_CONFIRMED` |
| `inventory.events` | `order-saga-group` | Order Service | Progress Saga: initiate payment on `INVENTORY_RESERVED`, or fail order on `INVENTORY_FAILED` |
| `payment.events` | `order-saga-group` | Order Service | Progress Saga: confirm order on `PAYMENT_COMPLETED`, or trigger stock compensation on `PAYMENT_FAILED` |
| `payment.events` | `notification-payment-group`| Notification Service | Dispatch payment failure alert or receipt |

---

## 5. Dead-Letter Topics (DLT) & Poison Pill Handling

When a consumer encounters an exception:
1. **Transient Errors** (e.g. database connection timeout, temporary downstream lock): Resilience4j retry with exponential backoff:
   - Attempt 1: 1000ms delay
   - Attempt 2: 2000ms delay
   - Attempt 3: 4000ms delay
2. **Permanent / Poison Pill Errors** (e.g. malformed JSON, serialization incompatibility, unrecoverable domain violation):
   - Caught by Spring Kafka `DefaultErrorHandler` with `DeadLetterPublishingRecoverer`.
   - Forwarded to corresponding Dead Letter Topic (e.g. `order.events.DLT`).
   - Consumer offset commits to prevent partition stall.
   - Admin UI displays failed event with stack trace and offers a manual replay endpoint.
