package com.ecom.catalog;

import com.ecom.catalog.dto.CategoryDto;
import com.ecom.catalog.dto.PageResponse;
import com.ecom.catalog.dto.ProductDto;
import com.ecom.catalog.service.CategoryService;
import com.ecom.catalog.service.ProductService;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class CatalogServiceIntegrationTest {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private ProductService productService;

    @Test
    @Order(1)
    void testCategoriesSeeded() {
        List<CategoryDto> categories = categoryService.getAllCategories();
        assertNotNull(categories);
        assertTrue(categories.size() >= 10, "Should have seeded at least 10 categories");
    }

    @Test
    @Order(2)
    void testProductsSeededAndPaged() {
        PageResponse<ProductDto> page = productService.getProducts(
                null, null, null, null, null, "newest", 0, 10);

        assertNotNull(page);
        assertTrue(page.getTotalElements() >= 50, "Should have seeded at least 50 products");
        assertEquals(10, page.getContent().size());
    }

    @Test
    @Order(3)
    void testProductSearch() {
        PageResponse<ProductDto> result = productService.getProducts(
                "OLED", null, null, null, null, "newest", 0, 10);

        assertNotNull(result);
        assertTrue(result.getTotalElements() > 0, "Should find OLED products");
        assertTrue(result.getContent().stream().anyMatch(p -> p.getName().contains("OLED") || p.getDescription().contains("OLED")));
    }

    @Test
    @Order(4)
    void testPriceRangeFiltering() {
        BigDecimal min = BigDecimal.valueOf(100);
        BigDecimal max = BigDecimal.valueOf(300);

        PageResponse<ProductDto> result = productService.getProducts(
                null, null, null, min, max, "price_low_to_high", 0, 20);

        assertNotNull(result);
        assertTrue(result.getTotalElements() > 0);
        for (ProductDto product : result.getContent()) {
            assertTrue(product.getPrice().compareTo(min) >= 0);
            assertTrue(product.getPrice().compareTo(max) <= 0);
        }
    }

    @Test
    @Order(5)
    void testProductLookupAndCaching() {
        PageResponse<ProductDto> page = productService.getProducts(
                null, null, null, null, null, "newest", 0, 1);
        assertFalse(page.getContent().isEmpty());

        String productId = page.getContent().get(0).getId();

        // 1st call (Cache Miss -> DB -> writes to Redis)
        ProductDto firstCall = productService.getProductById(productId);
        assertNotNull(firstCall);

        // 2nd call (Cache Hit from Redis)
        ProductDto secondCall = productService.getProductById(productId);
        assertNotNull(secondCall);
        assertEquals(firstCall.getId(), secondCall.getId());
        assertEquals(firstCall.getSku(), secondCall.getSku());
    }
}
