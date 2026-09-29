package com.ecom.inventory.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "inventory")
public class Inventory {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "product_id", nullable = false, unique = true, length = 64)
    private String productId;

    @Column(name = "available_quantity", nullable = false)
    private int availableQuantity;

    @Column(name = "reserved_quantity", nullable = false)
    private int reservedQuantity;

    @Column(name = "warehouse_id", nullable = false, length = 50)
    private String warehouseId;

    @Version
    @Column(nullable = false)
    private long version;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Inventory() {
        this.id = UUID.randomUUID().toString();
        this.warehouseId = "WH-MAIN-01";
        this.updatedAt = Instant.now();
    }

    public Inventory(String productId, int availableQuantity, String warehouseId) {
        this.id = UUID.randomUUID().toString();
        this.productId = productId;
        this.availableQuantity = availableQuantity;
        this.reservedQuantity = 0;
        this.warehouseId = warehouseId != null ? warehouseId : "WH-MAIN-01";
        this.updatedAt = Instant.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public int getAvailableQuantity() { return availableQuantity; }
    public void setAvailableQuantity(int availableQuantity) { this.availableQuantity = availableQuantity; }

    public int getReservedQuantity() { return reservedQuantity; }
    public void setReservedQuantity(int reservedQuantity) { this.reservedQuantity = reservedQuantity; }

    public String getWarehouseId() { return warehouseId; }
    public void setWarehouseId(String warehouseId) { this.warehouseId = warehouseId; }

    public long getVersion() { return version; }
    public void setVersion(long version) { this.version = version; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
