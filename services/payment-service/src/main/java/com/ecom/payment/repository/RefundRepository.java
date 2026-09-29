package com.ecom.payment.repository;

import com.ecom.payment.entity.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefundRepository extends JpaRepository<Refund, String> {
    List<Refund> findByOrderId(String orderId);
    List<Refund> findByPaymentId(String paymentId);
}
