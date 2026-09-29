# Inventory Consistency & Concurrency Control Specification

## 1. Problem: Overselling Under High Concurrency

During flash sales or high-demand product drops, multiple concurrent checkout threads attempt to reserve the same inventory stock simultaneously.

### The Race Condition (Lost Update)
Assume available inventory $A = 5$:
- User 1 requests $4$ units.
- User 2 requests $3$ units.
- If both read $A = 5$ concurrently:
  - User 1 computes new stock $5 - 4 = 1$ and writes $1$.
  - User 2 computes new stock $5 - 3 = 2$ and writes $2$.
Total items claimed: $4 + 3 = 7$. Actual stock was $5$. Result: $2$ oversold orders.

---

## 2. Evaluation of Concurrency Strategies

### Approach 1: Distributed Lock via Redis (Redlock)
- *How it works*: Threads acquire `SET lock:inv:{productId} my_random_token NX PX 3000` before reading inventory, then release after updating.
- *Pros*: Simple conceptually.
- *Cons*:
  - Network overhead for lock acquire and release on every checkout.
  - Risk of lock expiration while the transaction is still running (GC pause or DB stall), leading to split-brain.
  - If Redis fails or lags, checkout is completely blocked.

### Approach 2: Optimistic Locking with `@Version`
- *How it works*: JPA entity contains `@Version private Long version;`. When updating, Hibernate executes `UPDATE inventory SET available = ..., version = version + 1 WHERE id = ... AND version = expected_version`.
- *Pros*: No database read locks.
- *Cons*:
  - Under high contention (e.g. 100 concurrent requests for 10 items), 90% of requests fail with `OptimisticLockException` and trigger aggressive retry storms, thrashing the CPU and database.

### Approach 3: Atomic Conditional SQL Update (Selected Primary Approach)
- *How it works*:
```sql
UPDATE inventory 
SET available_quantity = available_quantity - :requestedQuantity,
    reserved_quantity = reserved_quantity + :requestedQuantity,
    version = version + 1,
    updated_at = CURRENT_TIMESTAMP
WHERE product_id = :productId 
  AND available_quantity >= :requestedQuantity;
```
- *Why it is optimal*:
  - Evaluated atomically inside PostgreSQL's row-level lock engine under `READ COMMITTED` isolation.
  - PostgreSQL locks only the specific row during the single atomic statement execution.
  - If the rows updated count is `1`, the reservation succeeded immediately.
  - If the rows updated count is `0`, stock was insufficient or exhausted; the transaction fails cleanly without any retry storms or stale updates.
  - Throughput scales to thousands of reservations per second per product row.

---

## 3. Reservation State Lifecycle

```
[Available Stock: 10, Reserved: 0]
             |
             | Order Created -> Reserve 2
             v
[Available Stock: 8, Reserved: 2] (Reservation ID: res-01, Status: PENDING)
             |
             +---------------------------------------+
             |                                       |
    Payment Succeeded                        Payment Failed / Timeout
             |                                       |
             v                                       v
[Available Stock: 8, Reserved: 0]       [Available Stock: 10, Reserved: 0]
(Reservation ID: res-01, CONFIRMED)     (Reservation ID: res-01, RELEASED)
```

### Safety Cleanup: Expired Reservations Job
If an unforeseen network catastrophe severs communication and an order is neither confirmed nor compensated within 15 minutes, an automated reaper worker sweeps expired reservations and restores available inventory:

```sql
UPDATE inventory inv
SET available_quantity = inv.available_quantity + res.quantity,
    reserved_quantity = inv.reserved_quantity - res.quantity
FROM inventory_reservations res
WHERE res.product_id = inv.product_id
  AND res.status = 'PENDING'
  AND res.expires_at < CURRENT_TIMESTAMP;
```
