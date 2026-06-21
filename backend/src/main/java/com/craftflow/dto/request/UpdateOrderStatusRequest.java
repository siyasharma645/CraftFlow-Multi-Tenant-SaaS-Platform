package com.craftflow.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateOrderStatusRequest(
    @NotBlank String status,
    String notes,
    String paymentStatus
) {}
