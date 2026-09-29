package com.ecom.common.constant;

public final class CommonConstants {
    private CommonConstants() {}

    // HTTP Headers
    public static final String HEADER_CORRELATION_ID = "X-Correlation-ID";
    public static final String HEADER_USER_ID = "X-User-Id";
    public static final String HEADER_USER_ROLE = "X-User-Role";
    public static final String HEADER_USER_EMAIL = "X-User-Email";
    public static final String HEADER_IDEMPOTENCY_KEY = "Idempotency-Key";

    // Kafka Topics
    public static final String TOPIC_ORDER_EVENTS = "order.events";
    public static final String TOPIC_INVENTORY_EVENTS = "inventory.events";
    public static final String TOPIC_PAYMENT_EVENTS = "payment.events";
    public static final String TOPIC_NOTIFICATION_EVENTS = "notification.events";

    // Dead Letter Topics
    public static final String TOPIC_ORDER_EVENTS_DLT = "order.events.DLT";
    public static final String TOPIC_INVENTORY_EVENTS_DLT = "inventory.events.DLT";
    public static final String TOPIC_PAYMENT_EVENTS_DLT = "payment.events.DLT";

    // Roles
    public static final String ROLE_CUSTOMER = "ROLE_CUSTOMER";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
}
