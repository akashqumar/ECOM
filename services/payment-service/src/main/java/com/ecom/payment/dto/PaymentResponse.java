package com.ecom.payment.dto;

import com.ecom.payment.model.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;

public class PaymentResponse {

    private String paymentId;
    private String orderId;
    private String userId;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private String provider;
    private String providerReference;
    private String errorCode;
    private String errorMessage;
    private Instant createdAt;

    public PaymentResponse() {
    }

    public PaymentResponse(String paymentId, String orderId, String userId, BigDecimal amount,
                           String currency, PaymentStatus status, String provider,
                           String providerReference, String errorCode, String errorMessage, Instant createdAt) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.userId = userId;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.provider = provider;
        this.providerReference = providerReference;
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
        this.createdAt = createdAt;
    }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getProviderReference() { return providerReference; }
    public void setProviderReference(String providerReference) { this.providerReference = providerReference; }

    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
