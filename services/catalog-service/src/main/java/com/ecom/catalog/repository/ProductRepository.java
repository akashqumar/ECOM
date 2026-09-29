package com.ecom.catalog.repository;

import com.ecom.catalog.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, String>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlug(String slug);
    Optional<Product> findBySku(String sku);
    boolean existsBySku(String sku);
    boolean existsBySlug(String slug);

    List<Product> findByCategoryId(String categoryId);

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.rating DESC")
    List<Product> findFeaturedProducts(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.reviewCount DESC")
    List<Product> findTrendingProducts(Pageable pageable);

    @Query(value = "SELECT * FROM products p WHERE p.status = 'ACTIVE' AND " +
            "to_tsvector('english', p.name || ' ' || p.brand || ' ' || p.description) @@ plainto_tsquery('english', :searchTerm)",
            countQuery = "SELECT count(*) FROM products p WHERE p.status = 'ACTIVE' AND " +
            "to_tsvector('english', p.name || ' ' || p.brand || ' ' || p.description) @@ plainto_tsquery('english', :searchTerm)",
            nativeQuery = true)
    Page<Product> searchFullText(@Param("searchTerm") String searchTerm, Pageable pageable);
}
