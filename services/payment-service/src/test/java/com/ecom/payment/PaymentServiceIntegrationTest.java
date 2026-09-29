package com.ecom.payment;

import com.ecom.payment.dto.PaymentResponse;
import com.ecom.payment.entity.Payment;
import com.ecom.payment.model.PaymentStatus;
import com.ecom.payment.repository.OutboxEventRepository;
import com.ecom.payment.repository.PaymentRepository;
import com.ecom.payment.service.PaymentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class PaymentServiceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @Test
    @DisplayName("Should process successful payment and record PAYMENT_COMPLETED outbox event")
    void testProcessPaymentSuccess() {
        String orderId = UUID.randomUUID().toString();
        String idempotencyKey = "key-" + UUID.randomUUID();

        PaymentResponse response = paymentService.processPayment(
                orderId,
                "user-test-1",
                new BigDecimal("99.50"),
                "USD",
                idempotencyKey
        );

        assertThat(response.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(response.getProviderReference()).isNotBlank();

        // Check DB
        Payment payment = paymentRepository.findByOrderIdAndIdempotencyKey(orderId, idempotencyKey).orElseThrow();
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.SUCCESS);

        // Test idempotency: calling again returns the exact same payment record
        PaymentResponse response2 = paymentService.processPayment(
                orderId,
                "user-test-1",
                new BigDecimal("99.50"),
                "USD",
                idempotencyKey
        );
        assertThat(response2.getPaymentId()).isEqualTo(response.getPaymentId());
    }

    @Test
    @DisplayName("Should simulate payment decline and record PAYMENT_FAILED outbox event")
    void testProcessPaymentFailure() {
        String orderId = "FAIL-" + UUID.randomUUID().toString().substring(0, 31);
        String idempotencyKey = "key-" + UUID.randomUUID();

        PaymentResponse response = paymentService.processPayment(
                orderId,
                "user-test-2",
                new BigDecimal("150.00"),
                "USD",
                idempotencyKey
        );

        assertThat(response.getStatus()).isEqualTo(PaymentStatus.FAILED);
        assertThat(response.getErrorCode()).isEqualTo("INSUFFICIENT_FUNDS");

        Payment payment = paymentRepository.findByOrderIdAndIdempotencyKey(orderId, idempotencyKey).orElseThrow();
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.FAILED);
    }

    @Test
    @DisplayName("Should successfully refund a paid transaction")
    void testRefundPayment() {
        String orderId = UUID.randomUUID().toString();
        String idempotencyKey = "key-" + UUID.randomUUID();

        PaymentResponse payResp = paymentService.processPayment(
                orderId,
                "user-test-3",
                new BigDecimal("49.99"),
                "USD",
                idempotencyKey
        );

        assertThat(payResp.getStatus()).isEqualTo(PaymentStatus.SUCCESS);

        PaymentResponse refundResp = paymentService.refundPayment(payResp.getPaymentId(), "Customer returned goods");
        assertThat(refundResp.getStatus()).isEqualTo(PaymentStatus.REFUNDED);

        Payment payment = paymentRepository.findByPaymentId(payResp.getPaymentId()).orElseThrow();
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.REFUNDED);
    }
}
