package com.ecom.inventory.repository;

import com.ecom.inventory.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, String> {

    Optional<Inventory> findByProductId(String productId);

    @Modifying
    @Query("UPDATE Inventory i SET i.availableQuantity = i.availableQuantity - :quantity, " +
            "i.reservedQuantity = i.reservedQuantity + :quantity, " +
            "i.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE i.productId = :productId AND i.availableQuantity >= :quantity")
    int reserveStockAtomic(@Param("productId") String productId, @Param("quantity") int quantity);

    @Modifying
    @Query("UPDATE Inventory i SET i.availableQuantity = i.availableQuantity + :quantity, " +
            "i.reservedQuantity = i.reservedQuantity - :quantity, " +
            "i.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE i.productId = :productId AND i.reservedQuantity >= :quantity")
    int releaseStockAtomic(@Param("productId") String productId, @Param("quantity") int quantity);

    @Modifying
    @Query("UPDATE Inventory i SET i.reservedQuantity = i.reservedQuantity - :quantity, " +
            "i.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE i.productId = :productId AND i.reservedQuantity >= :quantity")
    int confirmStockAtomic(@Param("productId") String productId, @Param("quantity") int quantity);
}
