package com.ecom.cart.model;

import java.io.Serializable;
import java.math.BigDecimal;

public class CartItem implements Serializable {

    private String productId;
    private String sku;
    private String name;
    private BigDecimal price;
    private int quantity;
    private String imageUrl;
    private BigDecimal subtotal;

    public CartItem() {}

    public CartItem(String productId, String sku, String name, BigDecimal price, int quantity, String imageUrl) {
        this.productId = productId;
        this.sku = sku;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.imageUrl = imageUrl;
        this.subtotal = price != null ? price.multiply(BigDecimal.valueOf(quantity)) : BigDecimal.ZERO;
    }

    public void recalculateSubtotal() {
        if (this.price != null && this.quantity > 0) {
            this.subtotal = this.price.multiply(BigDecimal.valueOf(this.quantity));
        } else {
            this.subtotal = BigDecimal.ZERO;
        }
    }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) {
        this.price = price;
        recalculateSubtotal();
    }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) {
        this.quantity = quantity;
        recalculateSubtotal();
    }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
}
