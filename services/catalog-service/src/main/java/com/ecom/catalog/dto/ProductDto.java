package com.ecom.catalog.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class ProductDto implements Serializable {

    private String id;
    private String sku;
    private String name;
    private String slug;
    private String description;
    private String brand;
    private String categoryId;
    private String categoryName;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private String currency;
    private List<String> images;
    private String status;
    private BigDecimal rating;
    private int reviewCount;
    private Instant createdAt;

    public ProductDto() {}

    public ProductDto(String id, String sku, String name, String slug, String description,
                      String brand, String categoryId, String categoryName, BigDecimal price,
                      BigDecimal discountPrice, String currency, List<String> images,
                      String status, BigDecimal rating, int reviewCount, Instant createdAt) {
        this.id = id;
        this.sku = sku;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.brand = brand;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.price = price;
        this.discountPrice = discountPrice;
        this.currency = currency;
        this.images = images;
        this.status = status;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getDiscountPrice() { return discountPrice; }
    public void setDiscountPrice(BigDecimal discountPrice) { this.discountPrice = discountPrice; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public int getReviewCount() { return reviewCount; }
    public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
