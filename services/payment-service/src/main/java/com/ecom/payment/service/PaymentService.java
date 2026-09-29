package com.ecom.payment.service;

import com.ecom.common.event.CloudEvent;
import com.ecom.common.event.EventType;
import com.ecom.common.exception.ResourceNotFoundException;
import com.ecom.payment.dto.PaymentResponse;
import com.ecom.payment.entity.OutboxEvent;
import com.ecom.payment.entity.Payment;
import com.ecom.payment.entity.Refund;
import com.ecom.payment.model.PaymentStatus;
import com.ecom.payment.provider.PaymentGatewayProvider;
import com.ecom.payment.repository.OutboxEventRepository;
import com.ecom.payment.repository.PaymentRepository;
import com.ecom.payment.repository.RefundRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final PaymentGatewayProvider gatewayProvider;

    public PaymentService(PaymentRepository paymentRepository,
                          RefundRepository refundRepository,
                          OutboxEventRepository outboxEventRepository,
                          PaymentGatewayProvider gatewayProvider) {
        this.paymentRepository = paymentRepository;
        this.refundRepository = refundRepository;
        this.outboxEventRepository = outboxEventRepository;
        this.gatewayProvider = gatewayProvider;
    }

    @Transactional
    public PaymentResponse processPayment(String orderId, String userId, BigDecimal amount, String currency, String idempotencyKey) {
        log.info("Processing payment for orderId={}, amount={} {}, key={}", orderId, amount, currency, idempotencyKey);

        // 1. Idempotency Check: deduplicate payment attempts for the same order and key
        Optional<Payment> existingOpt = paymentRepository.findByOrderIdAndIdempotencyKey(orderId, idempotencyKey);
        if (existingOpt.isPresent()) {
            Payment existing = existingOpt.get();
            log.info("Idempotent payment match found: paymentId={}, status={}", existing.getPaymentId(), existing.getStatus());
            return toDto(existing);
        }

        // 2. Create Payment record in INITIATED state
        Payment payment = new Payment(orderId, userId, amount, currency, idempotencyKey);
        payment = paymentRepository.save(payment);

        // 3. Delegate to payment gateway provider
        var result = gatewayProvider.processPayment(orderId, amount, currency, idempotencyKey);

        // 4. Update status and record Outbox event atomically
        Map<String, Object> outboxPayload = new HashMap<>();
        outboxPayload.put("orderId", orderId);
        outboxPayload.put("paymentId", payment.getPaymentId());
        outboxPayload.put("userId", userId);
        outboxPayload.put("amount", amount);
        outboxPayload.put("currency", currency);

        if (result.successful()) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setProviderReference(result.transactionId());
            paymentRepository.save(payment);

            outboxPayload.put("transactionId", result.transactionId());
            saveOutboxEvent("PAYMENT", orderId, EventType.PAYMENT_COMPLETED, outboxPayload);
            log.info("Payment succeeded for orderId={}, paymentId={}", orderId, payment.getPaymentId());
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setErrorCode(result.errorCode());
            payment.setErrorMessage(result.errorMessage());
            paymentRepository.save(payment);

            outboxPayload.put("errorCode", result.errorCode());
            outboxPayload.put("reason", result.errorMessage());
            saveOutboxEvent("PAYMENT", orderId, EventType.PAYMENT_FAILED, outboxPayload);
            log.warn("Payment failed for orderId={}, reason={}", orderId, result.errorMessage());
        }

        return toDto(payment);
    }

    @Transactional
    public PaymentResponse refundPayment(String paymentId, String reason) {
        log.info("Refunding paymentId={}, reason={}", paymentId, reason);

        Payment payment = paymentRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for paymentId: " + paymentId));

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new IllegalStateException("Cannot refund payment with status: " + payment.getStatus());
        }

        var refundResult = gatewayProvider.refundPayment(payment.getProviderReference(), payment.getAmount(), reason);

        if (refundResult.successful()) {
            payment.setStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);

            Refund refund = new Refund(payment, payment.getOrderId(), payment.getAmount(), reason);
            refundRepository.save(refund);

            Map<String, Object> outboxPayload = new HashMap<>();
            outboxPayload.put("orderId", payment.getOrderId());
            outboxPayload.put("paymentId", payment.getPaymentId());
            outboxPayload.put("refundId", refundResult.refundId());
            outboxPayload.put("amount", payment.getAmount());
            saveOutboxEvent("PAYMENT", payment.getOrderId(), EventType.PAYMENT_REFUNDED, outboxPayload);

            log.info("Refund completed for paymentId={}", paymentId);
        }

        return toDto(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByPaymentId(String paymentId) {
        Payment payment = paymentRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for paymentId: " + paymentId));
        return toDto(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByOrderId(String orderId) {
        return paymentRepository.findByOrderId(orderId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private void saveOutboxEvent(String aggregateType, String aggregateId, EventType eventType, Object payload) {
        CloudEvent<Object> cloudEvent = CloudEvent.of(
                eventType,
                aggregateType,
                aggregateId,
                null,
                null,
                "payment-service",
                payload
        );
        String payloadJson = com.ecom.common.util.JsonUtils.toJson(cloudEvent);
        OutboxEvent outboxEvent = new OutboxEvent(aggregateType, aggregateId, eventType.name(), payloadJson);
        outboxEventRepository.save(outboxEvent);
    }

    private PaymentResponse toDto(Payment p) {
        return new PaymentResponse(
                p.getPaymentId(),
                p.getOrderId(),
                p.getUserId(),
                p.getAmount(),
                p.getCurrency(),
                p.getStatus(),
                p.getProvider(),
                p.getProviderReference(),
                p.getErrorCode(),
                p.getErrorMessage(),
                p.getCreatedAt()
        );
    }
}
