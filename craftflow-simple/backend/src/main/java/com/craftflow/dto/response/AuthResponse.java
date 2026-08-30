package com.craftflow.dto.response;

import java.util.UUID;

public record AuthResponse(
    String token,
    UUID userId,
    UUID tenantId,
    String tenantSlug,
    String firstName,
    String lastName,
    String email,
    String role,
    String businessName
) {}
