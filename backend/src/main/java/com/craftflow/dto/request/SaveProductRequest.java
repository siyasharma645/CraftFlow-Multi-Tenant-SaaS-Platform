package com.craftflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.UUID;

public record SaveProductRequest(
    UUID categoryId,
    String sku,
    @NotBlank String name,
    String description,
    String shortDescription,
    @NotNull @Positive BigDecimal price,
    BigDecimal costPrice,
    String unit,
    Integer productionTimeHours,
    Integer stockQuantity,
    Integer lowStockThreshold,
    Boolean trackInventory,
    Boolean allowCustomOrders
) {}
