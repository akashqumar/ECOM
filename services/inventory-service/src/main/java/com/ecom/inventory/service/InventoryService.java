package com.ecom.inventory.service;

import com.ecom.common.event.CloudEvent;
import com.ecom.common.event.EventType;
import com.ecom.common.exception.InsufficientStockException;
import com.ecom.common.exception.ResourceNotFoundException;
import com.ecom.inventory.dto.*;
import com.ecom.inventory.entity.Inventory;
import com.ecom.inventory.entity.InventoryReservation;
import com.ecom.inventory.entity.OutboxEvent;
import com.ecom.inventory.repository.InventoryRepository;
import com.ecom.inventory.repository.InventoryReservationRepository;
import com.ecom.inventory.repository.OutboxEventRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryService.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final InventoryRepository inventoryRepository;
    private final InventoryReservationRepository reservationRepository;
    private final OutboxEventRepository outboxEventRepository;

    public InventoryService(InventoryRepository inventoryRepository,
                            InventoryReservationRepository reservationRepository,
                            OutboxEventRepository outboxEventRepository) {
        this.inventoryRepository = inventoryRepository;
        this.reservationRepository = reservationRepository;
        this.outboxEventRepository = outboxEventRepository;
    }

    @Transactional
    public ReserveStockResponse reserveStock(ReserveStockRequest request) {
        log.info("Attempting stock reservation for order: {}", request.getOrderId());

        List<String> reservationIds = new ArrayList<>();
        List<InventoryReservation> successfulReservations = new ArrayList<>();

        Instant expiresAt = Instant.now().plus(15, ChronoUnit.MINUTES);

        for (OrderItemRequest item : request.getItems()) {
            int updated = inventoryRepository.reserveStockAtomic(item.getProductId(), item.getQuantity());

            if (updated == 0) {
                log.warn("Insufficient stock for productId: {} (requested: {})", item.getProductId(), item.getQuantity());

                // Rollback any items already reserved in this transaction
                for (InventoryReservation rollbackRes : successfulReservations) {
                    inventoryRepository.releaseStockAtomic(rollbackRes.getProductId(), rollbackRes.getQuantity());
                    reservationRepository.delete(rollbackRes);
                }

                // Record Outbox failure event
                saveOutboxEvent(
                        "INVENTORY",
                        request.getOrderId(),
                        EventType.INVENTORY_RESERVATION_FAILED,
                        new ReserveStockResponse(request.getOrderId(), false, "Insufficient stock for product " + item.getProductId(), List.of())
                );

                throw new InsufficientStockException("Insufficient stock for product " + item.getProductId());
            }

            InventoryReservation reservation = new InventoryReservation(
                    request.getOrderId(),
                    item.getProductId(),
                    item.getQuantity(),
                    expiresAt
            );
            InventoryReservation savedRes = reservationRepository.save(reservation);
            successfulReservations.add(savedRes);
            reservationIds.add(savedRes.getId());
        }

        ReserveStockResponse response = new ReserveStockResponse(request.getOrderId(), true, "Stock reserved successfully", reservationIds);

        // Atomically record Outbox success event in the same DB transaction
        saveOutboxEvent("INVENTORY", request.getOrderId(), EventType.INVENTORY_RESERVED, response);

        log.info("Successfully reserved stock for order: {}", request.getOrderId());
        return response;
    }

    @Transactional
    public void releaseStock(String orderId) {
        log.info("Compensating: Releasing reserved stock for order: {}", orderId);
        List<InventoryReservation> pendingReservations = reservationRepository.findByOrderIdAndStatus(orderId, "PENDING");

        for (InventoryReservation res : pendingReservations) {
            inventoryRepository.releaseStockAtomic(res.getProductId(), res.getQuantity());
            res.setStatus("RELEASED");
            reservationRepository.save(res);
        }

        saveOutboxEvent("INVENTORY", orderId, EventType.INVENTORY_RELEASED, orderId);
        log.info("Released {} reservations for order: {}", pendingReservations.size(), orderId);
    }

    @Transactional
    public void confirmStock(String orderId) {
        log.info("Confirming reserved stock for order: {}", orderId);
        List<InventoryReservation> pendingReservations = reservationRepository.findByOrderIdAndStatus(orderId, "PENDING");

        for (InventoryReservation res : pendingReservations) {
            inventoryRepository.confirmStockAtomic(res.getProductId(), res.getQuantity());
            res.setStatus("CONFIRMED");
            reservationRepository.save(res);
        }

        saveOutboxEvent("INVENTORY", orderId, EventType.INVENTORY_DEDUCTED, orderId);
        log.info("Confirmed {} reservations for order: {}", pendingReservations.size(), orderId);
    }

    @Transactional(readOnly = true)
    public InventoryDto getInventoryByProductId(String productId) {
        Inventory inv = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory record not found for productId: " + productId));
        return toDto(inv);
    }

    @Transactional(readOnly = true)
    public List<InventoryDto> getAllInventory() {
        return inventoryRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public InventoryDto adjustStock(String productId, int delta) {
        Inventory inv = inventoryRepository.findByProductId(productId)
                .orElseGet(() -> new Inventory(productId, 0, "WH-MAIN-01"));

        int newAvailable = inv.getAvailableQuantity() + delta;
        if (newAvailable < 0) {
            throw new InsufficientStockException("Cannot reduce available inventory below zero");
        }

        inv.setAvailableQuantity(newAvailable);
        Inventory saved = inventoryRepository.save(inv);
        return toDto(saved);
    }

    private void saveOutboxEvent(String aggregateType, String aggregateId, EventType eventType, Object payload) {
        CloudEvent<Object> cloudEvent = CloudEvent.of(
                eventType,
                aggregateType,
                aggregateId,
                null,
                null,
                "inventory-service",
                payload
        );
        String payloadJson = com.ecom.common.util.JsonUtils.toJson(cloudEvent);
        OutboxEvent outboxEvent = new OutboxEvent(aggregateType, aggregateId, eventType.name(), payloadJson);
        outboxEventRepository.save(outboxEvent);
    }

    private InventoryDto toDto(Inventory inv) {
        return new InventoryDto(
                inv.getId(),
                inv.getProductId(),
                inv.getAvailableQuantity(),
                inv.getReservedQuantity(),
                inv.getWarehouseId(),
                inv.getUpdatedAt()
        );
    }
}
