package com.ecom.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.math.BigDecimal;
import java.util.List;

public class CheckoutRequest {

    @NotBlank(message = "Idempotency key is required")
    private String idempotencyKey;

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private String currency = "USD";

    private BigDecimal discount = BigDecimal.ZERO;

    private BigDecimal tax = BigDecimal.ZERO;

    private BigDecimal shippingFee = BigDecimal.ZERO;

    @NotEmpty(message = "Cart items cannot be empty")
    @Valid
    private List<OrderItemRequest> items;

    public CheckoutRequest() {
    }

    public CheckoutRequest(String idempotencyKey, String shippingAddress, List<OrderItemRequest> items) {
        this.idempotencyKey = idempotencyKey;
        this.shippingAddress = shippingAddress;
        this.items = items;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount;
    }

    public BigDecimal getTax() {
        return tax;
    }

    public void setTax(BigDecimal tax) {
        this.tax = tax;
    }

    public BigDecimal getShippingFee() {
        return shippingFee;
    }

    public void setShippingFee(BigDecimal shippingFee) {
        this.shippingFee = shippingFee;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}
