CREATE TABLE IF NOT EXISTS payments (
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

CREATE TABLE IF NOT EXISTS refunds (
    id VARCHAR(36) PRIMARY KEY,
    payment_id VARCHAR(36) NOT NULL REFERENCES payments(id),
    order_id VARCHAR(36) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL, -- PENDING, COMPLETED, FAILED
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS outbox_events (
    id VARCHAR(36) PRIMARY KEY,
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS processed_events (
    event_id VARCHAR(64) PRIMARY KEY,
    consumer_group VARCHAR(64) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_outbox_pending ON outbox_events(status, created_at) WHERE status = 'PENDING';
