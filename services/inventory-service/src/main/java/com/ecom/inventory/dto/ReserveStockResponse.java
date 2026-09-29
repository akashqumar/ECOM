package com.ecom.inventory.dto;

import java.util.List;

public class ReserveStockResponse {

    private String orderId;
    private boolean success;
    private String message;
    private List<String> reservationIds;

    public ReserveStockResponse() {}

    public ReserveStockResponse(String orderId, boolean success, String message, List<String> reservationIds) {
        this.orderId = orderId;
        this.success = success;
        this.message = message;
        this.reservationIds = reservationIds;
    }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public List<String> getReservationIds() { return reservationIds; }
    public void setReservationIds(List<String> reservationIds) { this.reservationIds = reservationIds; }
}
