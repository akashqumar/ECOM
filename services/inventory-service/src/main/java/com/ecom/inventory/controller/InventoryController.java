package com.ecom.inventory.controller;

import com.ecom.common.dto.ApiResponse;
import com.ecom.inventory.dto.*;
import com.ecom.inventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<InventoryDto>> getInventoryByProductId(@PathVariable String productId) {
        InventoryDto inventory = inventoryService.getInventoryByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success(inventory));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InventoryDto>>> getAllInventory() {
        List<InventoryDto> list = inventoryService.getAllInventory();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/reserve")
    public ResponseEntity<ApiResponse<ReserveStockResponse>> reserveStock(@Valid @RequestBody ReserveStockRequest request) {
        ReserveStockResponse response = inventoryService.reserveStock(request);
        return ResponseEntity.ok(ApiResponse.success("Stock reserved successfully", response));
    }

    @PostMapping("/release")
    public ResponseEntity<ApiResponse<Void>> releaseStock(@Valid @RequestBody ReleaseStockRequest request) {
        inventoryService.releaseStock(request.getOrderId());
        return ResponseEntity.ok(ApiResponse.success("Stock released successfully", null));
    }

    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<Void>> confirmStock(@Valid @RequestBody ConfirmStockRequest request) {
        inventoryService.confirmStock(request.getOrderId());
        return ResponseEntity.ok(ApiResponse.success("Stock confirmed successfully", null));
    }

    @PutMapping("/{productId}/adjust")
    public ResponseEntity<ApiResponse<InventoryDto>> adjustStock(
            @PathVariable String productId,
            @Valid @RequestBody StockAdjustmentRequest request) {
        InventoryDto updated = inventoryService.adjustStock(productId, request.getDelta());
        return ResponseEntity.ok(ApiResponse.success("Stock adjusted successfully", updated));
    }
}
