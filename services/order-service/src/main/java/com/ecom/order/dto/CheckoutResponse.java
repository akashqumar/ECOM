package com.ecom.order.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class CheckoutResponse {

    private String orderId;
    private String orderNumber;
    private String status;
    private BigDecimal totalAmount;
    private String currency;
    private String sagaStatus;
    private String message;
    private Instant createdAt;

    public CheckoutResponse() {
    }

    public CheckoutResponse(String orderId, String orderNumber, String status, BigDecimal totalAmount,
                            String currency, String sagaStatus, String message, Instant createdAt) {
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.status = status;
        this.totalAmount = totalAmount;
        this.currency = currency;
        this.sagaStatus = sagaStatus;
        this.message = message;
        this.createdAt = createdAt;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getSagaStatus() {
        return sagaStatus;
    }

    public void setSagaStatus(String sagaStatus) {
        this.sagaStatus = sagaStatus;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
