package com.ecom.cart.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class Cart implements Serializable {

    private String userId;
    private List<CartItem> items = new ArrayList<>();
    private int totalQuantity;
    private BigDecimal subtotalAmount;
    private Instant updatedAt;

    public Cart() {
        this.items = new ArrayList<>();
        this.totalQuantity = 0;
        this.subtotalAmount = BigDecimal.ZERO;
        this.updatedAt = Instant.now();
    }

    public Cart(String userId) {
        this.userId = userId;
        this.items = new ArrayList<>();
        this.totalQuantity = 0;
        this.subtotalAmount = BigDecimal.ZERO;
        this.updatedAt = Instant.now();
    }

    public void recalculateTotals() {
        int totalQty = 0;
        BigDecimal total = BigDecimal.ZERO;

        for (CartItem item : items) {
            item.recalculateSubtotal();
            totalQty += item.getQuantity();
            total = total.add(item.getSubtotal());
        }

        this.totalQuantity = totalQty;
        this.subtotalAmount = total;
        this.updatedAt = Instant.now();
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public List<CartItem> getItems() { return items; }
    public void setItems(List<CartItem> items) {
        this.items = items != null ? items : new ArrayList<>();
        recalculateTotals();
    }

    public int getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(int totalQuantity) { this.totalQuantity = totalQuantity; }

    public BigDecimal getSubtotalAmount() { return subtotalAmount; }
    public void setSubtotalAmount(BigDecimal subtotalAmount) { this.subtotalAmount = subtotalAmount; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
