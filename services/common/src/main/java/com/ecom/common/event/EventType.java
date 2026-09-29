package com.ecom.common.event;

public enum EventType {
    // Order events
    ORDER_CREATED,
    ORDER_CONFIRMED,
    ORDER_CANCELLED,
    ORDER_SHIPPED,
    ORDER_DELIVERED,

    // Inventory events
    INVENTORY_RESERVED,
    INVENTORY_RESERVATION_FAILED,
    INVENTORY_RELEASED,
    INVENTORY_DEDUCTED,

    // Payment events
    PAYMENT_REQUESTED,
    PAYMENT_COMPLETED,
    PAYMENT_FAILED,
    PAYMENT_REFUNDED,

    // Notification events
    NOTIFICATION_REQUESTED
}
