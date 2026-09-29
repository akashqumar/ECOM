package com.ecom.inventory.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "inventory_reservations")
public class InventoryReservation {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "order_id", nullable = false, length = 64)
    private String orderId;

    @Column(name = "product_id", nullable = false, length = 64)
    private String productId;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false, length = 30)
    private String status; // PENDING, CONFIRMED, RELEASED

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    public InventoryReservation() {
        this.id = UUID.randomUUID().toString();
        this.status = "PENDING";
        this.createdAt = Instant.now();
    }

    public InventoryReservation(String orderId, String productId, int quantity, Instant expiresAt) {
        this.id = UUID.randomUUID().toString();
        this.orderId = orderId;
        this.productId = productId;
        this.quantity = quantity;
        this.status = "PENDING";
        this.createdAt = Instant.now();
        this.expiresAt = expiresAt;
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
}
