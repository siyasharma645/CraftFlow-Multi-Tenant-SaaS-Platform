package com.craftflow.dto.response;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

public record InventoryResponse(
    UUID id,
    String type,
    String name,
    String description,
    String sku,
    String unit,
    BigDecimal quantity,
    BigDecimal reservedQuantity,
    BigDecimal availableQuantity,
    BigDecimal lowStockThreshold,
    BigDecimal unitCost,
    String supplierName,
    String location,
    boolean isLowStock,
    ZonedDateTime lastRestockedAt,
    ZonedDateTime createdAt
) {}
