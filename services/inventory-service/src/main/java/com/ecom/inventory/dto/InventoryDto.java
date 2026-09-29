package com.ecom.inventory.dto;

import java.time.Instant;

public class InventoryDto {

    private String id;
    private String productId;
    private int availableQuantity;
    private int reservedQuantity;
    private int totalQuantity;
    private String warehouseId;
    private boolean lowStock;
    private Instant updatedAt;

    public InventoryDto() {}

    public InventoryDto(String id, String productId, int availableQuantity, int reservedQuantity,
                        String warehouseId, Instant updatedAt) {
        this.id = id;
        this.productId = productId;
        this.availableQuantity = availableQuantity;
        this.reservedQuantity = reservedQuantity;
        this.totalQuantity = availableQuantity + reservedQuantity;
        this.warehouseId = warehouseId;
        this.lowStock = availableQuantity <= 5;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public int getAvailableQuantity() { return availableQuantity; }
    public void setAvailableQuantity(int availableQuantity) { this.availableQuantity = availableQuantity; }

    public int getReservedQuantity() { return reservedQuantity; }
    public void setReservedQuantity(int reservedQuantity) { this.reservedQuantity = reservedQuantity; }

    public int getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(int totalQuantity) { this.totalQuantity = totalQuantity; }

    public String getWarehouseId() { return warehouseId; }
    public void setWarehouseId(String warehouseId) { this.warehouseId = warehouseId; }

    public boolean isLowStock() { return lowStock; }
    public void setLowStock(boolean lowStock) { this.lowStock = lowStock; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
