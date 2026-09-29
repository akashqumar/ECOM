package com.ecom.payment.repository;

import com.ecom.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    Optional<Payment> findByOrderIdAndIdempotencyKey(String orderId, String idempotencyKey);
    Optional<Payment> findByPaymentId(String paymentId);
    List<Payment> findByOrderId(String orderId);
    List<Payment> findByUserId(String userId);
}
