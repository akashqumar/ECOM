package com.ecom.payment.provider;

import java.math.BigDecimal;

public interface PaymentGatewayProvider {

    GatewayTransactionResult processPayment(String orderId, BigDecimal amount, String currency, String idempotencyKey);

    GatewayRefundResult refundPayment(String transactionId, BigDecimal amount, String reason);

    record GatewayTransactionResult(boolean successful, String transactionId, String errorCode, String errorMessage) {}
    record GatewayRefundResult(boolean successful, String refundId, String errorCode, String errorMessage) {}
}
