package com.ecom.catalog.service;

import com.ecom.common.exception.BusinessRuleException;
import com.ecom.common.exception.ResourceNotFoundException;
import com.ecom.catalog.dto.CategoryDto;
import com.ecom.catalog.dto.CreateCategoryRequest;
import com.ecom.catalog.entity.Category;
import com.ecom.catalog.repository.CategoryRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'all'")
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "#id")
    public CategoryDto getCategoryById(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return toDto(category);
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryDto createCategory(CreateCategoryRequest request) {
        String slug = generateSlug(request.getName());
        if (categoryRepository.existsBySlug(slug)) {
            throw new BusinessRuleException("Category with name/slug '" + slug + "' already exists");
        }

        Category category = new Category(
                request.getName().trim(),
                slug,
                request.getDescription(),
                request.getParentCategoryId()
        );

        Category saved = categoryRepository.save(category);
        return toDto(saved);
    }

    private String generateSlug(String input) {
        return input.toLowerCase(Locale.ENGLISH)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }

    public CategoryDto toDto(Category c) {
        return new CategoryDto(
                c.getId(),
                c.getName(),
                c.getSlug(),
                c.getDescription(),
                c.getParentCategoryId(),
                c.getCreatedAt()
        );
    }
}
