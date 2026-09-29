package com.ecom.cart.dto;

import jakarta.validation.constraints.Min;

public class UpdateQuantityRequest {

    @Min(value = 0, message = "Quantity must be 0 or greater (0 removes item)")
    private int quantity;

    public UpdateQuantityRequest() {}

    public UpdateQuantityRequest(int quantity) {
        this.quantity = quantity;
    }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
