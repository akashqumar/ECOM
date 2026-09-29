package com.ecom.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class ReserveStockRequest {

    @NotBlank(message = "Order ID is required")
    private String orderId;

    @NotEmpty(message = "Items list cannot be empty")
    @Valid
    private List<OrderItemRequest> items;

    public ReserveStockRequest() {}

    public ReserveStockRequest(String orderId, List<OrderItemRequest> items) {
        this.orderId = orderId;
        this.items = items;
    }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }
}
