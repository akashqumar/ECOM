package com.ecom.catalog.dto;

import java.time.Instant;

public class CategoryDto {

    private String id;
    private String name;
    private String slug;
    private String description;
    private String parentCategoryId;
    private Instant createdAt;

    public CategoryDto() {}

    public CategoryDto(String id, String name, String slug, String description, String parentCategoryId, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.parentCategoryId = parentCategoryId;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getParentCategoryId() { return parentCategoryId; }
    public void setParentCategoryId(String parentCategoryId) { this.parentCategoryId = parentCategoryId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
