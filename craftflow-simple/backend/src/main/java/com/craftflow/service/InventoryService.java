package com.craftflow.service;

import com.craftflow.dto.request.InventoryTransactionRequest;
import com.craftflow.dto.request.SaveInventoryRequest;
import com.craftflow.dto.response.InventoryResponse;
import com.craftflow.entity.*;
import com.craftflow.exception.BusinessException;
import com.craftflow.exception.ResourceNotFoundException;
import com.craftflow.repository.*;
import com.craftflow.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public InventoryResponse createItem(SaveInventoryRequest request) {
        UUID tenantId = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findById(tenantId).orElseThrow();

        Inventory item = Inventory.builder()
            .tenant(tenant)
            .type(Inventory.InventoryType.valueOf(request.type()))
            .name(request.name())
            .description(request.description())
            .sku(request.sku())
            .unit(request.unit())
            .quantity(BigDecimal.ZERO)
            .lowStockThreshold(request.lowStockThreshold() != null ? request.lowStockThreshold() : BigDecimal.TEN)
            .unitCost(request.unitCost())
            .supplierName(request.supplierName())
            .location(request.location())
            .build();

        return toResponse(inventoryRepository.save(item));
    }

    @Transactional
    public InventoryResponse adjustStock(UUID itemId, InventoryTransactionRequest request, UUID userId) {
        UUID tenantId = TenantContext.getTenantId();
        Inventory item = inventoryRepository.findByTenantIdAndId(tenantId, itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Inventory item", itemId));

        InventoryTransaction.TransactionType txType =
            InventoryTransaction.TransactionType.valueOf(request.type());

        BigDecimal quantityBefore = item.getQuantity();
        BigDecimal newQuantity;

        switch (txType) {
            case STOCK_IN -> {
                newQuantity = quantityBefore.add(request.quantity());
                item.setLastRestockedAt(ZonedDateTime.now());
            }
            case STOCK_OUT -> {
                if (item.getAvailableQuantity().compareTo(request.quantity()) < 0) {
                    throw new BusinessException("Insufficient stock. Available: " + item.getAvailableQuantity());
                }
                newQuantity = quantityBefore.subtract(request.quantity());
            }
            case ADJUSTMENT -> newQuantity = request.quantity();
            default -> newQuantity = quantityBefore.add(request.quantity());
        }

        item.setQuantity(newQuantity);
        if (request.unitCost() != null) {
            item.setUnitCost(request.unitCost());
        }

        User performer = userRepository.findById(userId).orElseThrow();
        InventoryTransaction tx = InventoryTransaction.builder()
            .tenant(item.getTenant())
            .inventory(item)
            .type(txType)
            .quantity(request.quantity())
            .quantityBefore(quantityBefore)
            .quantityAfter(newQuantity)
            .unitCost(request.unitCost())
            .notes(request.notes())
            .performedBy(performer)
            .build();

        transactionRepository.save(tx);
        Inventory saved = inventoryRepository.save(item);

        // Check low stock
        if (saved.isLowStock()) {
            notificationService.sendLowStockAlert(saved);
        }

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<InventoryResponse> getAll(Pageable pageable) {
        UUID tenantId = TenantContext.getTenantId();
        return inventoryRepository.findByTenantId(tenantId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> getLowStock() {
        UUID tenantId = TenantContext.getTenantId();
        return inventoryRepository.findLowStockItems(tenantId).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public InventoryResponse toResponse(Inventory item) {
        return new InventoryResponse(
            item.getId(), item.getType().name(), item.getName(), item.getDescription(),
            item.getSku(), item.getUnit(), item.getQuantity(), item.getReservedQuantity(),
            item.getAvailableQuantity(), item.getLowStockThreshold(),
            item.getUnitCost(), item.getSupplierName(), item.getLocation(),
            item.isLowStock(), item.getLastRestockedAt(), item.getCreatedAt()
        );
    }
}
