package com.craftflow.dto.response;

import java.math.BigDecimal;
import java.util.Map;

public record DashboardResponse(
    long totalOrders,
    long pendingOrders,
    long inProductionOrders,
    long delayedOrders,
    long ordersDueToday,
    long ordersDueThisWeek,
    BigDecimal monthlyRevenue,
    Map<String, Long> statusBreakdown,
    long lowStockAlerts
) {}
