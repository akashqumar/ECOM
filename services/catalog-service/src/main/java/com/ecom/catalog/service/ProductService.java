package com.ecom.catalog.service;

import com.ecom.common.exception.BusinessRuleException;
import com.ecom.common.exception.ResourceNotFoundException;
import com.ecom.catalog.dto.CreateProductRequest;
import com.ecom.catalog.dto.PageResponse;
import com.ecom.catalog.dto.ProductDto;
import com.ecom.catalog.dto.UpdateProductRequest;
import com.ecom.catalog.entity.Category;
import com.ecom.catalog.entity.Product;
import com.ecom.catalog.repository.CategoryRepository;
import com.ecom.catalog.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductDto> getProducts(
            String search,
            String categoryId,
            String brand,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sort,
            int page,
            int size) {

        Sort sortObj = resolveSort(sort);
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), sortObj);

        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), "ACTIVE"));

            if (StringUtils.hasText(search)) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("name")), searchPattern);
                Predicate brandLike = cb.like(cb.lower(root.get("brand")), searchPattern);
                Predicate descLike = cb.like(cb.lower(root.get("description")), searchPattern);
                Predicate skuLike = cb.like(cb.lower(root.get("sku")), searchPattern);
                predicates.add(cb.or(nameLike, brandLike, descLike, skuLike));
            }

            if (StringUtils.hasText(categoryId)) {
                predicates.add(cb.equal(root.get("categoryId"), categoryId));
            }

            if (StringUtils.hasText(brand)) {
                predicates.add(cb.equal(cb.lower(root.get("brand")), brand.trim().toLowerCase()));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> productPage = productRepository.findAll(spec, pageable);
        Map<String, String> catMap = getCategoryMap();

        List<ProductDto> dtos = productPage.getContent().stream()
                .map(p -> toDto(p, catMap.get(p.getCategoryId())))
                .collect(Collectors.toList());

        return new PageResponse<>(
                dtos,
                productPage.getNumber(),
                productPage.getSize(),
                productPage.getTotalElements(),
                productPage.getTotalPages(),
                productPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "#id")
    public ProductDto getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        String categoryName = categoryRepository.findById(product.getCategoryId())
                .map(Category::getName)
                .orElse("General");
        return toDto(product, categoryName);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "products_by_slug", key = "#slug")
    public ProductDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with slug: " + slug));
        String categoryName = categoryRepository.findById(product.getCategoryId())
                .map(Category::getName)
                .orElse("General");
        return toDto(product, categoryName);
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getFeaturedProducts(int limit) {
        Pageable pageable = PageRequest.of(0, Math.max(1, limit));
        List<Product> products = productRepository.findFeaturedProducts(pageable);
        Map<String, String> catMap = getCategoryMap();
        return products.stream()
                .map(p -> toDto(p, catMap.get(p.getCategoryId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getTrendingProducts(int limit) {
        Pageable pageable = PageRequest.of(0, Math.max(1, limit));
        List<Product> products = productRepository.findTrendingProducts(pageable);
        Map<String, String> catMap = getCategoryMap();
        return products.stream()
                .map(p -> toDto(p, catMap.get(p.getCategoryId())))
                .collect(Collectors.toList());
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "products", allEntries = true),
            @CacheEvict(value = "products_by_slug", allEntries = true)
    })
    public ProductDto createProduct(CreateProductRequest request) {
        if (productRepository.existsBySku(request.getSku().trim())) {
            throw new BusinessRuleException("Product with SKU '" + request.getSku() + "' already exists");
        }

        String slug = generateSlug(request.getName() + "-" + request.getSku());
        if (productRepository.existsBySlug(slug)) {
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 8);
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Product product = new Product(
                request.getSku().trim().toUpperCase(),
                request.getName().trim(),
                slug,
                request.getDescription().trim(),
                request.getBrand().trim(),
                category.getId(),
                request.getPrice(),
                request.getDiscountPrice(),
                request.getImages(),
                BigDecimal.valueOf(5.0),
                0
        );

        Product saved = productRepository.save(product);
        return toDto(saved, category.getName());
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "products", key = "#id"),
            @CacheEvict(value = "products_by_slug", allEntries = true)
    })
    public ProductDto updateProduct(String id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        product.setName(request.getName().trim());
        product.setDescription(request.getDescription().trim());
        product.setBrand(request.getBrand().trim());
        product.setCategoryId(category.getId());
        product.setPrice(request.getPrice());
        product.setDiscountPrice(request.getDiscountPrice());
        if (request.getImages() != null) {
            product.setImages(request.getImages());
        }
        if (StringUtils.hasText(request.getStatus())) {
            product.setStatus(request.getStatus().trim().toUpperCase());
        }

        Product saved = productRepository.save(product);
        return toDto(saved, category.getName());
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "products", key = "#id"),
            @CacheEvict(value = "products_by_slug", allEntries = true)
    })
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        product.setStatus("ARCHIVED");
        productRepository.save(product);
    }

    private Sort resolveSort(String sort) {
        if (!StringUtils.hasText(sort)) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        return switch (sort.toLowerCase()) {
            case "price_low_to_high" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_high_to_low" -> Sort.by(Sort.Direction.DESC, "price");
            case "popularity" -> Sort.by(Sort.Direction.DESC, "reviewCount");
            case "rating" -> Sort.by(Sort.Direction.DESC, "rating");
            case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private Map<String, String> getCategoryMap() {
        return categoryRepository.findAll().stream()
                .collect(Collectors.toMap(Category::getId, Category::getName, (k1, k2) -> k1));
    }

    private String generateSlug(String input) {
        return input.toLowerCase(Locale.ENGLISH)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }

    public ProductDto toDto(Product p, String categoryName) {
        return new ProductDto(
                p.getId(),
                p.getSku(),
                p.getName(),
                p.getSlug(),
                p.getDescription(),
                p.getBrand(),
                p.getCategoryId(),
                categoryName != null ? categoryName : "General",
                p.getPrice(),
                p.getDiscountPrice(),
                p.getCurrency(),
                p.getImages(),
                p.getStatus(),
                p.getRating(),
                p.getReviewCount(),
                p.getCreatedAt()
        );
    }
}
