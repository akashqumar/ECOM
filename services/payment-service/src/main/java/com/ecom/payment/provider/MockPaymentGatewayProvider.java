package com.ecom.payment.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class MockPaymentGatewayProvider implements PaymentGatewayProvider {

    private static final Logger log = LoggerFactory.getLogger(MockPaymentGatewayProvider.class);

    @Override
    public GatewayTransactionResult processPayment(String orderId, BigDecimal amount, String currency, String idempotencyKey) {
        log.info("MockGateway: processing payment for orderId={}, amount={} {}, key={}", orderId, amount, currency, idempotencyKey);

        // Deterministic failure simulation hook for Saga compensation demo:
        // Any order amount ending in .99 will simulate card decline if order contains "FAIL" or starts with "FAIL-"
        if (orderId.startsWith("FAIL-") || (amount.remainder(BigDecimal.ONE).compareTo(new BigDecimal("0.99")) == 0 && orderId.contains("fail"))) {
            log.warn("MockGateway: Simulating payment decline for orderId={}", orderId);
            return new GatewayTransactionResult(false, null, "INSUFFICIENT_FUNDS", "Mock payment failure: Insufficient funds or card declined");
        }

        String txnId = "txn_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        log.info("MockGateway: Payment successful, txnId={}", txnId);
        return new GatewayTransactionResult(true, txnId, null, null);
    }

    @Override
    public GatewayRefundResult refundPayment(String transactionId, BigDecimal amount, String reason) {
        log.info("MockGateway: refunding transactionId={}, amount={}, reason={}", transactionId, amount, reason);
        String refId = "ref_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        return new GatewayRefundResult(true, refId, null, null);
    }
}
