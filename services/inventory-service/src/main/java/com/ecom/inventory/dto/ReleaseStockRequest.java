package com.ecom.inventory.dto;

import jakarta.validation.constraints.NotBlank;

public class ReleaseStockRequest {

    @NotBlank(message = "Order ID is required")
    private String orderId;

    public ReleaseStockRequest() {}

    public ReleaseStockRequest(String orderId) {
        this.orderId = orderId;
    }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
}
