package com.craftflow.dto.response;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public record CustomerResponse(
    UUID id,
    String firstName,
    String lastName,
    String fullName,
    String email,
    String phone,
    String whatsapp,
    String notes,
    Integer totalOrders,
    BigDecimal totalSpent,
    BigDecimal averageOrderValue,
    ZonedDateTime lastOrderAt,
    Boolean isActive,
    List<AddressResponse> addresses,
    ZonedDateTime createdAt
) {
    public record AddressResponse(
        UUID id,
        String label,
        String addressLine1,
        String addressLine2,
        String city,
        String state,
        String postalCode,
        String country,
        Boolean isDefault
    ) {}
}
