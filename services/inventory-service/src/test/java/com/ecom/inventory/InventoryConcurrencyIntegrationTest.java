package com.ecom.inventory;

import com.ecom.common.exception.InsufficientStockException;
import com.ecom.inventory.dto.InventoryDto;
import com.ecom.inventory.dto.OrderItemRequest;
import com.ecom.inventory.dto.ReserveStockRequest;
import com.ecom.inventory.dto.ReserveStockResponse;
import com.ecom.inventory.entity.Inventory;
import com.ecom.inventory.repository.InventoryRepository;
import com.ecom.inventory.service.InventoryService;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class InventoryConcurrencyIntegrationTest {

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Test
    @Order(1)
    void testSingleItemReservationAndRelease() {
        String productId = "test-prod-" + UUID.randomUUID();
        inventoryRepository.save(new Inventory(productId, 20, "WH-MAIN-01"));

        String orderId = "ord-" + UUID.randomUUID();
        ReserveStockRequest request = new ReserveStockRequest(
                orderId,
                List.of(new OrderItemRequest(productId, 5))
        );

        ReserveStockResponse response = inventoryService.reserveStock(request);
        assertTrue(response.isSuccess());

        InventoryDto afterReserve = inventoryService.getInventoryByProductId(productId);
        assertEquals(15, afterReserve.getAvailableQuantity());
        assertEquals(5, afterReserve.getReservedQuantity());

        // Test Release Compensation
        inventoryService.releaseStock(orderId);
        InventoryDto afterRelease = inventoryService.getInventoryByProductId(productId);
        assertEquals(20, afterRelease.getAvailableQuantity());
        assertEquals(0, afterRelease.getReservedQuantity());
    }

    @Test
    @Order(2)
    void testConcurrentHighDemandReservationPreventingOverselling() throws InterruptedException {
        // Setup a limited-stock product with exactly 5 items available
        String limitedProductId = "flash-sale-prod-" + UUID.randomUUID();
        final int initialStock = 5;
        final int concurrentThreads = 50;

        inventoryRepository.save(new Inventory(limitedProductId, initialStock, "WH-MAIN-01"));

        ExecutorService executor = Executors.newFixedThreadPool(concurrentThreads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(concurrentThreads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        for (int i = 0; i < concurrentThreads; i++) {
            final int index = i;
            executor.submit(() -> {
                try {
                    startLatch.await(); // Ensure all 50 threads fire at the EXACT same millisecond
                    String orderId = "order-concurrent-" + index + "-" + UUID.randomUUID();
                    inventoryService.reserveStock(new ReserveStockRequest(
                            orderId,
                            List.of(new OrderItemRequest(limitedProductId, 1))
                    ));
                    successCount.incrementAndGet();
                } catch (InsufficientStockException ex) {
                    failureCount.incrementAndGet();
                } catch (Exception ex) {
                    failureCount.incrementAndGet();
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        // Fire all threads simultaneously
        startLatch.countDown();
        boolean completed = finishLatch.await(15, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(completed, "All concurrent reservation tasks should complete within 15 seconds");

        // Mathematical verification of zero-overselling guarantee
        assertEquals(initialStock, successCount.get(),
                "Exactly 5 purchases must succeed when initial stock was 5");
        assertEquals(concurrentThreads - initialStock, failureCount.get(),
                "Exactly 45 purchases must fail with insufficient stock");

        // Verify database state integrity
        Inventory finalInventory = inventoryRepository.findByProductId(limitedProductId).orElseThrow();
        assertEquals(0, finalInventory.getAvailableQuantity(), "Available quantity must be 0");
        assertEquals(initialStock, finalInventory.getReservedQuantity(), "Reserved quantity must be exactly 5");
    }
}
