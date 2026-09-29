# Database Design & Isolation Specification

## 1. Database-Per-Service Architecture

Each microservice encapsulates its own dedicated PostgreSQL database. No microservice is permitted to issue cross-database SQL queries or share database credentials. Inter-service data sharing occurs strictly via REST APIs (synchronous) or Kafka events (asynchronous).

```
+--------------------+        +---------------------+        +--------------------+
|    User Service    |        |   Catalog Service   |        |   Order Service    |
+--------------------+        +---------------------+        +--------------------+
          |                              |                              |
          v                              v                              v
+--------------------+        +---------------------+        +--------------------+
|      user_db       |        |     catalog_db      |        |      order_db      |
+--------------------+        +---------------------+        +--------------------+

+--------------------+        +---------------------+        +--------------------+
| Inventory Service  |        |   Payment Service   |        |Notification Service|
+--------------------+        +---------------------+        +--------------------+
          |                              |                              |
          v                              v                              v
+--------------------+        +---------------------+        +--------------------+
|    inventory_db    |        |     payment_db      |        |  notification_db   |
+--------------------+        +---------------------+        +--------------------+
```

---

## 2. Schema Definitions & DDL Specifications

### 2.1 User Service (`user_db`)

```sql
-- Flyway: V1__init_user_schema.sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(30) NOT NULL DEFAULT 'ROLE_CUSTOMER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE addresses (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
```

### 2.2 Catalog Service (`catalog_db`)

```sql
-- Flyway: V1__init_catalog_schema.sql
CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    parent_category_id VARCHAR(36) REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    sku VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(280) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    brand VARCHAR(100) NOT NULL,
    category_id VARCHAR(36) NOT NULL REFERENCES categories(id),
    price NUMERIC(12, 2) NOT NULL,
    discount_price NUMERIC(12, 2),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    rating NUMERIC(3, 2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing Strategy
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
-- Full-Text Search GIN index for high-performance multi-column searching
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || brand || ' ' || description));
```

### 2.3 Inventory Service (`inventory_db`)

```sql
-- Flyway: V1__init_inventory_schema.sql
CREATE TABLE inventory (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL UNIQUE,
    available_quantity INTEGER NOT NULL CHECK (available_quantity >= 0),
    reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    warehouse_id VARCHAR(50) NOT NULL DEFAULT 'WH-MAIN-01',
    version BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_reservations (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL, -- PENDING, CONFIRMED, RELEASED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

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

CREATE TABLE processed_events (
    event_id VARCHAR(64) PRIMARY KEY,
    consumer_group VARCHAR(64) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inv_product_id ON inventory(product_id);
CREATE INDEX idx_inv_res_order_id ON inventory_reservations(order_id);
CREATE INDEX idx_inv_outbox_pending ON outbox_events(status, created_at) WHERE status = 'PENDING';
```

### 2.4 Order Service (`order_db`)

```sql
-- Flyway: V1__init_order_schema.sql
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    order_number VARCHAR(64) NOT NULL UNIQUE,
    user_id VARCHAR(36) NOT NULL,
    idempotency_key VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    shipping_address_snapshot JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_orders_user_idempotency UNIQUE (user_id, idempotency_key)
);

CREATE TABLE order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(36) NOT NULL,
    product_name_snapshot VARCHAR(255) NOT NULL,
    sku_snapshot VARCHAR(64) NOT NULL,
    price_snapshot NUMERIC(12, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(12, 2) NOT NULL
);

CREATE TABLE saga_instances (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL UNIQUE,
    current_step VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL, -- STARTED, IN_PROGRESS, COMPLETED, COMPENSATING, FAILED
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE processed_events (
    event_id VARCHAR(64) PRIMARY KEY,
    consumer_group VARCHAR(64) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_outbox_pending ON outbox_events(status, created_at) WHERE status = 'PENDING';
```

### 2.5 Payment Service (`payment_db`)

```sql
-- Flyway: V1__init_payment_schema.sql
CREATE TABLE payments (
    id VARCHAR(36) PRIMARY KEY,
    payment_id VARCHAR(64) NOT NULL UNIQUE,
    order_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    status VARCHAR(30) NOT NULL, -- INITIATED, PROCESSING, SUCCESS, FAILED, REFUND_PENDING, REFUNDED
    provider VARCHAR(50) NOT NULL DEFAULT 'MOCK_GATEWAY',
    provider_reference VARCHAR(100),
    idempotency_key VARCHAR(100) NOT NULL,
    error_code VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_payment_order_idempotency UNIQUE (order_id, idempotency_key)
);

CREATE TABLE refunds (
    id VARCHAR(36) PRIMARY KEY,
    payment_id VARCHAR(36) NOT NULL REFERENCES payments(id),
    order_id VARCHAR(36) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL, -- PENDING, COMPLETED, FAILED
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE processed_events (
    event_id VARCHAR(64) PRIMARY KEY,
    consumer_group VARCHAR(64) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payment_outbox_pending ON outbox_events(status, created_at) WHERE status = 'PENDING';
```

### 2.6 Notification Service (`notification_db`)

```sql
-- Flyway: V1__init_notification_schema.sql
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    order_id VARCHAR(36),
    channel VARCHAR(30) NOT NULL, -- EMAIL, IN_APP
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SENT',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE processed_events (
    event_id VARCHAR(64) PRIMARY KEY,
    consumer_group VARCHAR(64) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notif_user_id ON notifications(user_id, created_at DESC);
```

---

## 3. Indexing Justification Matrix

| Index Identifier | Table | Column(s) | Type | Rationale & Query Pattern Solved |
| :--- | :--- | :--- | :--- | :--- |
| `idx_products_search` | `products` | `name \|\| brand \|\| description` | GIN | Enables sub-10ms keyword search across catalog without full-table scan |
| `idx_products_category_id` | `products` | `category_id` | B-tree | Accelerates faceted category browsing and pagination |
| `uq_orders_user_idempotency` | `orders` | `(user_id, idempotency_key)` | Unique | Hardware-level prevention of duplicate orders if client retries `POST /checkout` |
| `idx_inv_outbox_pending` | `outbox_events` | `(status, created_at) WHERE status = 'PENDING'` | Partial B-tree | Guarantees the Outbox polling query only scans uncommitted events, ignoring millions of historical rows |
| `processed_events_pkey` | `processed_events`| `event_id` | Primary Key | Guarantees idempotent consumer execution: fast insert will fail with duplicate key if event was handled |
