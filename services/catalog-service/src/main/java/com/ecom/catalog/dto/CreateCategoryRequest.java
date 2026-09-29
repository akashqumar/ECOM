package com.ecom.catalog.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateCategoryRequest {

    @NotBlank(message = "Category name is required")
    private String name;

    private String description;

    private String parentCategoryId;

    public CreateCategoryRequest() {}

    public CreateCategoryRequest(String name, String description, String parentCategoryId) {
        this.name = name;
        this.description = description;
        this.parentCategoryId = parentCategoryId;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getParentCategoryId() { return parentCategoryId; }
    public void setParentCategoryId(String parentCategoryId) { this.parentCategoryId = parentCategoryId; }
}
