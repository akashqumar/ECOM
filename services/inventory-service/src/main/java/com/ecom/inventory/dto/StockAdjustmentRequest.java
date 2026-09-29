package com.ecom.inventory.dto;

import jakarta.validation.constraints.NotNull;

public class StockAdjustmentRequest {

    @NotNull(message = "Quantity delta is required")
    private Integer delta;

    private String reason;

    public StockAdjustmentRequest() {}

    public StockAdjustmentRequest(Integer delta, String reason) {
        this.delta = delta;
        this.reason = reason;
    }

    public Integer getDelta() { return delta; }
    public void setDelta(Integer delta) { this.delta = delta; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
