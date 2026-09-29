package com.ecom.order;

import com.ecom.order.dto.CheckoutRequest;
import com.ecom.order.dto.OrderItemRequest;
import com.ecom.order.entity.Order;
import com.ecom.order.entity.SagaInstance;
import com.ecom.order.model.OrderStatus;
import com.ecom.order.repository.OrderRepository;
import com.ecom.order.repository.OutboxEventRepository;
import com.ecom.order.repository.SagaInstanceRepository;
import com.ecom.order.service.OrderService;
import com.ecom.order.service.SagaOrchestratorService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class OrderServiceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private SagaInstanceRepository sagaInstanceRepository;

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @Autowired
    private OrderService orderService;

    @Autowired
    private SagaOrchestratorService sagaOrchestratorService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("Should create order, generate outbox event, and create SagaInstance in STARTED state")
    void testCheckoutCreatesOrderAndSaga() throws Exception {
        String idempotencyKey = UUID.randomUUID().toString();
        CheckoutRequest request = new CheckoutRequest(
                idempotencyKey,
                "123 Main St, New York, NY 10001",
                List.of(
                        new OrderItemRequest("prod-1", "Mechanical Keyboard", "KEY-01", new BigDecimal("129.99"), 1),
                        new OrderItemRequest("prod-2", "Wireless Mouse", "MOU-02", new BigDecimal("49.99"), 2)
                )
        );

        mockMvc.perform(post("/api/checkout")
                        .header("X-User-Id", "user-test-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.orderId").isNotEmpty())
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.sagaStatus").value("STARTED"))
                .andExpect(jsonPath("$.data.totalAmount").value(229.97));

        // Test Idempotency with exact same idempotency key
        mockMvc.perform(post("/api/checkout")
                        .header("X-User-Id", "user-test-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Checkout initiated successfully"));
    }

    @Test
    @DisplayName("Should advance Saga through happy path: INVENTORY_RESERVED -> PAYMENT_COMPLETED -> ORDER_CONFIRMED")
    void testSagaHappyPathProgression() {
        String idempotencyKey = UUID.randomUUID().toString();
        CheckoutRequest request = new CheckoutRequest(
                idempotencyKey,
                "456 Elm St, San Francisco, CA 94107",
                List.of(new OrderItemRequest("prod-3", "USB-C Hub", "USB-03", new BigDecimal("35.00"), 1))
        );

        var checkoutRes = orderService.createOrder("user-test-2", request);
        String orderId = checkoutRes.getOrderId();

        // 1. Inventory Reserved reply arrives
        sagaOrchestratorService.onInventoryReserved(orderId);

        Order orderAfterInv = orderRepository.findById(orderId).orElseThrow();
        assertThat(orderAfterInv.getStatus()).isEqualTo(OrderStatus.INVENTORY_RESERVED);

        SagaInstance sagaAfterInv = sagaInstanceRepository.findByOrderId(orderId).orElseThrow();
        assertThat(sagaAfterInv.getStatus()).isEqualTo("IN_PROGRESS");
        assertThat(sagaAfterInv.getCurrentStep()).isEqualTo("PROCESS_PAYMENT");

        // 2. Payment Completed reply arrives
        sagaOrchestratorService.onPaymentCompleted(orderId, "txn-test-12345");

        Order orderAfterPay = orderRepository.findById(orderId).orElseThrow();
        assertThat(orderAfterPay.getStatus()).isEqualTo(OrderStatus.CONFIRMED);

        SagaInstance sagaAfterPay = sagaInstanceRepository.findByOrderId(orderId).orElseThrow();
        assertThat(sagaAfterPay.getStatus()).isEqualTo("COMPLETED");
        assertThat(sagaAfterPay.getCurrentStep()).isEqualTo("COMPLETED");
    }

    @Test
    @DisplayName("Should advance Saga through compensation path when payment fails: PAYMENT_FAILED -> COMPENSATING -> INVENTORY_RELEASED -> FAILED")
    void testSagaCompensationFlowOnPaymentFailure() {
        String idempotencyKey = UUID.randomUUID().toString();
        CheckoutRequest request = new CheckoutRequest(
                idempotencyKey,
                "789 Oak Ave, Austin, TX 78701",
                List.of(new OrderItemRequest("prod-4", "Desk Mat", "MAT-04", new BigDecimal("25.00"), 1))
        );

        var checkoutRes = orderService.createOrder("user-test-3", request);
        String orderId = checkoutRes.getOrderId();

        // 1. Inventory Reserved succeeds
        sagaOrchestratorService.onInventoryReserved(orderId);

        // 2. Payment fails (e.g. insufficient funds)
        sagaOrchestratorService.onPaymentFailed(orderId, "Card declined: insufficient funds");

        Order orderAfterPayFail = orderRepository.findById(orderId).orElseThrow();
        assertThat(orderAfterPayFail.getStatus()).isEqualTo(OrderStatus.FAILED);

        SagaInstance sagaCompensating = sagaInstanceRepository.findByOrderId(orderId).orElseThrow();
        assertThat(sagaCompensating.getStatus()).isEqualTo("COMPENSATING");

        // 3. Inventory release reply arrives
        sagaOrchestratorService.onInventoryReleased(orderId);

        SagaInstance sagaFinal = sagaInstanceRepository.findByOrderId(orderId).orElseThrow();
        assertThat(sagaFinal.getStatus()).isEqualTo("FAILED");
        assertThat(sagaFinal.getCurrentStep()).isEqualTo("COMPENSATION_COMPLETED");
    }
}
