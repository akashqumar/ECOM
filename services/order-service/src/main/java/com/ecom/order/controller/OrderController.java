package com.ecom.order.controller;

import com.ecom.common.dto.ApiResponse;
import com.ecom.order.dto.CheckoutRequest;
import com.ecom.order.dto.CheckoutResponse;
import com.ecom.order.dto.OrderResponse;
import com.ecom.order.dto.OrderTimelineResponse;
import com.ecom.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<CheckoutResponse>> checkout(
            @RequestHeader(value = "X-User-Id", defaultValue = "user-demo-123") String userId,
            @Valid @RequestBody CheckoutRequest request) {

        CheckoutResponse response = orderService.createOrder(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Checkout initiated successfully", response));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getUserOrders(
            @RequestHeader(value = "X-User-Id", defaultValue = "user-demo-123") String userId,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<OrderResponse> orders = orderService.getOrdersByUserId(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable("id") String id) {
        OrderResponse order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success("Order details retrieved successfully", order));
    }

    @PostMapping("/orders/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable("id") String id,
            @RequestBody(required = false) Map<String, String> body) {

        String reason = (body != null && body.containsKey("reason")) ? body.get("reason") : "Cancelled by user";
        OrderResponse order = orderService.cancelOrder(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", order));
    }

    @GetMapping("/orders/{id}/timeline")
    public ResponseEntity<ApiResponse<OrderTimelineResponse>> getOrderTimeline(@PathVariable("id") String id) {
        OrderTimelineResponse timeline = orderService.getOrderTimeline(id);
        return ResponseEntity.ok(ApiResponse.success("Order timeline retrieved successfully", timeline));
    }
}
