package com.ecom.catalog.controller;

import com.ecom.common.dto.ApiResponse;
import com.ecom.catalog.dto.CreateProductRequest;
import com.ecom.catalog.dto.PageResponse;
import com.ecom.catalog.dto.ProductDto;
import com.ecom.catalog.dto.UpdateProductRequest;
import com.ecom.catalog.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductDto>>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false, defaultValue = "newest") String sort,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "12") int size) {

        PageResponse<ProductDto> products = productService.getProducts(
                search, categoryId, brand, minPrice, maxPrice, sort, page, size);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getProductById(@PathVariable String id) {
        ProductDto product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ProductDto>> getProductBySlug(@PathVariable String slug) {
        ProductDto product = productService.getProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getFeaturedProducts(
            @RequestParam(required = false, defaultValue = "8") int limit) {
        List<ProductDto> products = productService.getFeaturedProducts(limit);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getTrendingProducts(
            @RequestParam(required = false, defaultValue = "8") int limit) {
        List<ProductDto> products = productService.getTrendingProducts(limit);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductDto created = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Product created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @PathVariable String id,
            @Valid @RequestBody UpdateProductRequest request) {
        ProductDto updated = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product archived successfully", null));
    }
}
