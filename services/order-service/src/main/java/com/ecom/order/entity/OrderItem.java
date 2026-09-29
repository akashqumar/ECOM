package com.ecom.order.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

    @Column(name = "product_id", nullable = false, length = 64)
    private String productId;

    @Column(name = "product_name_snapshot", nullable = false, length = 255)
    private String productNameSnapshot;

    @Column(name = "sku_snapshot", nullable = false, length = 64)
    private String skuSnapshot;

    @Column(name = "price_snapshot", nullable = false, precision = 12, scale = 2)
    private BigDecimal priceSnapshot;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    public OrderItem() {
    }

    public OrderItem(String productId, String productNameSnapshot, String skuSnapshot, BigDecimal priceSnapshot, Integer quantity) {
        this.id = UUID.randomUUID().toString();
        this.productId = productId;
        this.productNameSnapshot = productNameSnapshot;
        this.skuSnapshot = skuSnapshot;
        this.priceSnapshot = priceSnapshot;
        this.quantity = quantity;
        this.subtotal = priceSnapshot.multiply(BigDecimal.valueOf(quantity));
    }

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (subtotal == null && priceSnapshot != null && quantity != null) {
            subtotal = priceSnapshot.multiply(BigDecimal.valueOf(quantity));
        }
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getProductNameSnapshot() {
        return productNameSnapshot;
    }

    public void setProductNameSnapshot(String productNameSnapshot) {
        this.productNameSnapshot = productNameSnapshot;
    }

    public String getSkuSnapshot() {
        return skuSnapshot;
    }

    public void setSkuSnapshot(String skuSnapshot) {
        this.skuSnapshot = skuSnapshot;
    }

    public BigDecimal getPriceSnapshot() {
        return priceSnapshot;
    }

    public void setPriceSnapshot(BigDecimal priceSnapshot) {
        this.priceSnapshot = priceSnapshot;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
}
