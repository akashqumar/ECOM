package com.ecom.payment.controller;

import com.ecom.common.dto.ApiResponse;
import com.ecom.payment.dto.PaymentResponse;
import com.ecom.payment.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPayment(@PathVariable("paymentId") String paymentId) {
        PaymentResponse response = paymentService.getPaymentByPaymentId(paymentId);
        return ResponseEntity.ok(ApiResponse.success("Payment retrieved successfully", response));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByOrder(@PathVariable("orderId") String orderId) {
        List<PaymentResponse> response = paymentService.getPaymentsByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success("Payments for order retrieved successfully", response));
    }

    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<ApiResponse<PaymentResponse>> refundPayment(
            @PathVariable("paymentId") String paymentId,
            @RequestBody(required = false) Map<String, String> body) {

        String reason = (body != null && body.containsKey("reason")) ? body.get("reason") : "Customer requested refund";
        PaymentResponse response = paymentService.refundPayment(paymentId, reason);
        return ResponseEntity.ok(ApiResponse.success("Payment refunded successfully", response));
    }
}
