package com.craftflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record SaveInventoryRequest(
    @NotBlank String type,
    @NotBlank String name,
    String description,
    String sku,
    @NotBlank String unit,
    BigDecimal lowStockThreshold,
    BigDecimal unitCost,
    String supplierName,
    String supplierContact,
    String location
) {}
