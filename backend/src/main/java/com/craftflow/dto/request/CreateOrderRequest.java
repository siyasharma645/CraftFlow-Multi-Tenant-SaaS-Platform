package com.craftflow.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CreateOrderRequest(
    UUID customerId,
    @NotEmpty @Valid List<OrderItemRequest> items,
    LocalDate deliveryDate,
    BigDecimal taxAmount,
    BigDecimal shippingAmount,
    BigDecimal discountAmount,
    String notes,
    String customerNotes,
    Boolean isRushOrder,
    String paymentMethod
) {
    public record OrderItemRequest(
        @NotNull UUID productId,
        @NotNull @Positive Integer quantity,
        BigDecimal discountPercent,
        String customizationNotes
    ) {}
}
