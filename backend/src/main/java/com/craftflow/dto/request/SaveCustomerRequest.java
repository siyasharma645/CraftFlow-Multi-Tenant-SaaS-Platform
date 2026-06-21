package com.craftflow.dto.request;

import jakarta.validation.constraints.NotBlank;

public record SaveCustomerRequest(
    @NotBlank String firstName,
    @NotBlank String lastName,
    String email,
    String phone,
    String whatsapp,
    String notes,
    AddressRequest address
) {
    public record AddressRequest(
        String addressLine1,
        String addressLine2,
        String city,
        String state,
        String postalCode,
        String country
    ) {}
}
