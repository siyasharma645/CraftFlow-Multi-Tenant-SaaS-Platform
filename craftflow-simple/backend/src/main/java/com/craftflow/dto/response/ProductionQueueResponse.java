package com.craftflow.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ProductionQueueResponse(
    List<QueueItem> queue,
    int queueSize,
    long delayedCount,
    long atRiskCount,
    long dueTodayCount,
    long dueThisWeekCount,
    int capacityPerDay,
    double capacityUtilisation,
    LocalDate earliestFreeDate
) {
    public record QueueItem(
        UUID orderId,
        String orderNumber,
        String customerName,
        String status,
        LocalDate deliveryDate,
        LocalDate estimatedCompletionDate,
        boolean isDelayed,
        boolean willBeDelayed,
        Long daysUntilDue,
        boolean isRushOrder,
        int priority,
        BigDecimal totalAmount
    ) {}
}
