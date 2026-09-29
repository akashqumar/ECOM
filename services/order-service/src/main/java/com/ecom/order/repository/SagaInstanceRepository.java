package com.ecom.order.repository;

import com.ecom.order.entity.SagaInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SagaInstanceRepository extends JpaRepository<SagaInstance, String> {
    Optional<SagaInstance> findByOrderId(String orderId);
}
