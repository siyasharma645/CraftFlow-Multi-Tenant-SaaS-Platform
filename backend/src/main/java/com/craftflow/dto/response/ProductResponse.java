package com.craftflow.dto.response;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

public record ProductResponse(
    UUID id,
    String sku,
    String name,
    String description,
    String shortDescription,
    BigDecimal price,
    BigDecimal costPrice,
    BigDecimal salePrice,
    String unit,
    Integer productionTimeHours,
    Integer stockQuantity,
    Integer lowStockThreshold,
    Boolean trackInventory,
    Boolean isActive,
    Boolean isFeatured,
    Boolean allowCustomOrders,
    Boolean isLowStock,
    UUID categoryId,
    String categoryName,
    String categoryColor,
    ZonedDateTime createdAt,
    ZonedDateTime updatedAt
) {}
