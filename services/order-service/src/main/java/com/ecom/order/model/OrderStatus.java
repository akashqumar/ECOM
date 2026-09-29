package com.ecom.order.model;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

public enum OrderStatus {
    PENDING,
    INVENTORY_RESERVED,
    PAYMENT_PENDING,
    PAID,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED,
    FAILED,
    REFUND_PENDING,
    REFUNDED;

    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = new EnumMap<>(OrderStatus.class);

    static {
        VALID_TRANSITIONS.put(PENDING, EnumSet.of(INVENTORY_RESERVED, FAILED, CANCELLED));
        VALID_TRANSITIONS.put(INVENTORY_RESERVED, EnumSet.of(PAYMENT_PENDING, PAID, FAILED, CANCELLED));
        VALID_TRANSITIONS.put(PAYMENT_PENDING, EnumSet.of(PAID, FAILED, CANCELLED));
        VALID_TRANSITIONS.put(PAID, EnumSet.of(CONFIRMED, CANCELLED, REFUND_PENDING));
        VALID_TRANSITIONS.put(CONFIRMED, EnumSet.of(PROCESSING, CANCELLED, REFUND_PENDING));
        VALID_TRANSITIONS.put(PROCESSING, EnumSet.of(SHIPPED, CANCELLED, REFUND_PENDING));
        VALID_TRANSITIONS.put(SHIPPED, EnumSet.of(DELIVERED));
        VALID_TRANSITIONS.put(DELIVERED, EnumSet.of(REFUND_PENDING));
        VALID_TRANSITIONS.put(CANCELLED, EnumSet.of(REFUND_PENDING, REFUNDED));
        VALID_TRANSITIONS.put(REFUND_PENDING, EnumSet.of(REFUNDED));
        VALID_TRANSITIONS.put(FAILED, EnumSet.noneOf(OrderStatus.class));
        VALID_TRANSITIONS.put(REFUNDED, EnumSet.noneOf(OrderStatus.class));
    }

    public boolean canTransitionTo(OrderStatus next) {
        Set<OrderStatus> allowed = VALID_TRANSITIONS.get(this);
        return allowed != null && allowed.contains(next);
    }
}
