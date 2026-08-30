package com.craftflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record InventoryTransactionRequest(
    @NotBlank String type,
    @NotNull @Positive BigDecimal quantity,
    BigDecimal unitCost,
    String notes
) {}
