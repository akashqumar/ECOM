package com.ecom.catalog.entity;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, unique = true, length = 64)
    private String sku;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 280)
    private String slug;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 100)
    private String brand;

    @Column(name = "category_id", nullable = false, length = 36)
    private String categoryId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "discount_price", precision = 12, scale = 2)
    private BigDecimal discountPrice;

    @Column(nullable = false, length = 10)
    private String currency;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> images = new ArrayList<>();

    @Column(nullable = false, length = 30)
    private String status;

    @Column(precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(name = "review_count")
    private int reviewCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Product() {
        this.id = UUID.randomUUID().toString();
        this.currency = "USD";
        this.status = "ACTIVE";
        this.rating = BigDecimal.valueOf(0.0);
        this.reviewCount = 0;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public Product(String sku, String name, String slug, String description, String brand,
                   String categoryId, BigDecimal price, BigDecimal discountPrice,
                   List<String> images, BigDecimal rating, int reviewCount) {
        this.id = UUID.randomUUID().toString();
        this.sku = sku;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.brand = brand;
        this.categoryId = categoryId;
        this.price = price;
        this.discountPrice = discountPrice;
        this.currency = "USD";
        this.images = images != null ? images : new ArrayList<>();
        this.status = "ACTIVE";
        this.rating = rating != null ? rating : BigDecimal.valueOf(0.0);
        this.reviewCount = reviewCount;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
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

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
