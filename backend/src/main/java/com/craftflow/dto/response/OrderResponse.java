package com.craftflow.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
    UUID id,
    String orderNumber,
    UUID customerId,
    String customerName,
    String customerPhone,
    String status,
    String paymentStatus,
    BigDecimal subtotal,
    BigDecimal discountAmount,
    BigDecimal taxAmount,
    BigDecimal shippingAmount,
    BigDecimal totalAmount,
    BigDecimal amountPaid,
    String currency,
    LocalDate deliveryDate,
    ZonedDateTime deliveredAt,
    String notes,
    Boolean isRushOrder,
    Integer priority,
    Boolean isDelayed,
    List<OrderItemResponse> items,
    List<StatusHistoryResponse> statusHistory,
    ZonedDateTime createdAt,
    ZonedDateTime updatedAt
) {
    public record OrderItemResponse(
        UUID id,
        String productName,
        String productSku,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal discountPercent,
        BigDecimal lineTotal,
        String customizationNotes,
        String productionStatus,
        UUID productId
    ) {}

    public record StatusHistoryResponse(
        String fromStatus,
        String toStatus,
        String changedBy,
        String notes,
        ZonedDateTime changedAt
    ) {}
}
