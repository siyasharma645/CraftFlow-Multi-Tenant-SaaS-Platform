package com.craftflow.service;

import com.craftflow.dto.response.ProductionQueueResponse;
import com.craftflow.entity.Order;
import com.craftflow.repository.BusinessRepository;
import com.craftflow.repository.OrderRepository;
import com.craftflow.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Smart Production Planning Engine
 *
 * Automatically:
 * 1. Prioritises orders by delivery deadline + rush flag
 * 2. Estimates completion dates based on capacity
 * 3. Detects delayed orders
 * 4. Calculates capacity utilisation
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductionSchedulingService {

    private final OrderRepository orderRepository;
    private final BusinessRepository businessRepository;

    @Transactional(readOnly = true)
    public ProductionQueueResponse getProductionPlan() {
        UUID tenantId = TenantContext.getTenantId();
        LocalDate today = LocalDate.now();

        // Fetch active production queue — already sorted by priority+deadline in repo
        List<Order> queue = orderRepository.findProductionQueue(tenantId);

        // Get business production capacity
        int capacityPerDay = businessRepository.findByTenantId(tenantId)
            .map(b -> b.getProductionCapacityPerDay() != null ? b.getProductionCapacityPerDay() : 10)
            .orElse(10);

        // Estimate dates based on sequential scheduling
        LocalDate scheduleDate = today;
        int dailyCount = 0;
        List<ProductionQueueResponse.QueueItem> items = new ArrayList<>();

        for (Order order : queue) {
            if (dailyCount >= capacityPerDay) {
                scheduleDate = scheduleDate.plusDays(1);
                dailyCount = 0;
            }

            boolean isDelayed = order.getDeliveryDate() != null
                && today.isAfter(order.getDeliveryDate());

            boolean willBeDelayed = order.getDeliveryDate() != null
                && scheduleDate.isAfter(order.getDeliveryDate());

            long daysUntilDue = order.getDeliveryDate() != null
                ? ChronoUnit.DAYS.between(today, order.getDeliveryDate())
                : Long.MAX_VALUE;

            items.add(new ProductionQueueResponse.QueueItem(
                order.getId(),
                order.getOrderNumber(),
                order.getCustomer() != null ? order.getCustomer().getFullName() : null,
                order.getStatus().name(),
                order.getDeliveryDate(),
                scheduleDate,
                isDelayed,
                willBeDelayed,
                daysUntilDue < Long.MAX_VALUE ? daysUntilDue : null,
                order.getIsRushOrder(),
                order.getPriority(),
                order.getTotalAmount()
            ));

            dailyCount++;
        }

        // Metrics
        long delayedCount = items.stream().filter(ProductionQueueResponse.QueueItem::isDelayed).count();
        long atRiskCount = items.stream().filter(i -> !i.isDelayed() && i.willBeDelayed()).count();
        long dueTodayCount = queue.stream()
            .filter(o -> today.equals(o.getDeliveryDate()))
            .count();
        long dueThisWeekCount = queue.stream()
            .filter(o -> o.getDeliveryDate() != null
                && !today.isAfter(o.getDeliveryDate())
                && today.plusDays(7).isAfter(o.getDeliveryDate()))
            .count();

        double capacityUtilisation = queue.isEmpty() ? 0.0
            : Math.min(100.0, (double) queue.size() / (capacityPerDay * 5) * 100);

        return new ProductionQueueResponse(
            items,
            queue.size(),
            delayedCount,
            atRiskCount,
            dueTodayCount,
            dueThisWeekCount,
            capacityPerDay,
            capacityUtilisation,
            scheduleDate
        );
    }
}
