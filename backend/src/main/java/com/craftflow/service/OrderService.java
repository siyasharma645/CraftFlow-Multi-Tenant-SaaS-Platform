package com.craftflow.service;

import com.craftflow.dto.request.CreateOrderRequest;
import com.craftflow.dto.request.UpdateOrderStatusRequest;
import com.craftflow.dto.response.OrderResponse;
import com.craftflow.dto.response.DashboardResponse;
import com.craftflow.entity.*;
import com.craftflow.exception.BusinessException;
import com.craftflow.exception.ResourceNotFoundException;
import com.craftflow.repository.*;
import com.craftflow.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, UUID userId) {
        UUID tenantId = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findById(tenantId).orElseThrow();

        Customer customer = null;
        if (request.customerId() != null) {
            customer = customerRepository.findByTenantIdAndId(tenantId, request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.customerId()));
        }

        String orderNumber = generateOrderNumber(tenantId);

        Order order = Order.builder()
            .tenant(tenant)
            .orderNumber(orderNumber)
            .customer(customer)
            .deliveryDate(request.deliveryDate())
            .notes(request.notes())
            .customerNotes(request.customerNotes())
            .currency("INR")
            .isRushOrder(request.isRushOrder() != null && request.isRushOrder())
            .priority(request.isRushOrder() != null && request.isRushOrder() ? 10 : 5)
            .build();

        // Add items
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CreateOrderRequest.OrderItemRequest itemReq : request.items()) {
            Product product = productRepository.findByTenantIdAndId(tenantId, itemReq.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", itemReq.productId()));

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.quantity()));
            if (itemReq.discountPercent() != null && itemReq.discountPercent().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal discount = lineTotal.multiply(itemReq.discountPercent()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                lineTotal = lineTotal.subtract(discount);
            }

            OrderItem item = OrderItem.builder()
                .order(order)
                .tenant(tenant)
                .product(product)
                .productName(product.getName())
                .productSku(product.getSku())
                .quantity(itemReq.quantity())
                .unitPrice(product.getPrice())
                .discountPercent(itemReq.discountPercent() != null ? itemReq.discountPercent() : BigDecimal.ZERO)
                .lineTotal(lineTotal)
                .customizationNotes(itemReq.customizationNotes())
                .build();

            order.getItems().add(item);
            subtotal = subtotal.add(lineTotal);
        }

        order.setSubtotal(subtotal);
        order.setTaxAmount(request.taxAmount() != null ? request.taxAmount() : BigDecimal.ZERO);
        order.setShippingAmount(request.shippingAmount() != null ? request.shippingAmount() : BigDecimal.ZERO);
        order.setDiscountAmount(request.discountAmount() != null ? request.discountAmount() : BigDecimal.ZERO);
        order.setTotalAmount(subtotal
            .add(order.getTaxAmount())
            .add(order.getShippingAmount())
            .subtract(order.getDiscountAmount()));

        // Add initial status history
        User user = userRepository.findById(userId).orElseThrow();
        OrderStatusHistory history = OrderStatusHistory.builder()
            .order(order)
            .tenant(tenant)
            .toStatus(Order.OrderStatus.RECEIVED.name())
            .changedBy(user)
            .notes("Order created")
            .build();
        order.getStatusHistory().add(history);

        Order saved = orderRepository.save(order);

        // Update customer stats
        if (customer != null) {
            customer.setTotalOrders(customer.getTotalOrders() + 1);
            customer.setTotalSpent(customer.getTotalSpent().add(saved.getTotalAmount()));
            customer.setAverageOrderValue(customer.getTotalSpent()
                .divide(BigDecimal.valueOf(customer.getTotalOrders()), 2, RoundingMode.HALF_UP));
            customer.setLastOrderAt(ZonedDateTime.now());
            customerRepository.save(customer);
        }

        // Send notification
        notificationService.sendOrderNotification(saved, "NEW_ORDER");

        log.info("Order {} created for tenant {}", orderNumber, tenantId);
        return toResponse(saved);
    }

    @Transactional
    public OrderResponse updateStatus(UUID orderId, UpdateOrderStatusRequest request, UUID userId) {
        UUID tenantId = TenantContext.getTenantId();
        Order order = orderRepository.findByTenantIdAndId(tenantId, orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        Order.OrderStatus newStatus = Order.OrderStatus.valueOf(request.status());
        if (!order.getStatus().canTransitionTo(newStatus)) {
            throw new BusinessException(
                "Cannot transition order from " + order.getStatus() + " to " + newStatus
            );
        }

        Order.OrderStatus oldStatus = order.getStatus();
        order.setStatus(newStatus);

        if (newStatus == Order.OrderStatus.DELIVERED) {
            order.setDeliveredAt(ZonedDateTime.now());
            if (request.paymentStatus() != null) {
                order.setPaymentStatus(Order.PaymentStatus.valueOf(request.paymentStatus()));
            }
        }

        User user = userRepository.findById(userId).orElseThrow();
        OrderStatusHistory history = OrderStatusHistory.builder()
            .order(order)
            .tenant(order.getTenant())
            .fromStatus(oldStatus.name())
            .toStatus(newStatus.name())
            .changedBy(user)
            .notes(request.notes())
            .build();
        order.getStatusHistory().add(history);

        Order saved = orderRepository.save(order);
        notificationService.sendOrderNotification(saved, "STATUS_CHANGED");

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrders(
        Order.OrderStatus status, UUID customerId,
        ZonedDateTime from, ZonedDateTime to, Pageable pageable
    ) {
        UUID tenantId = TenantContext.getTenantId();
        return orderRepository.search(tenantId, status, customerId, from, to, pageable)
            .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(UUID orderId) {
        UUID tenantId = TenantContext.getTenantId();
        return orderRepository.findByTenantIdAndId(tenantId, orderId)
            .map(this::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getProductionQueue() {
        UUID tenantId = TenantContext.getTenantId();
        return orderRepository.findProductionQueue(tenantId).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        UUID tenantId = TenantContext.getTenantId();
        LocalDate today = LocalDate.now();
        LocalDate weekEnd = today.plusDays(7);

        long dueToday = orderRepository.countOrdersDueOn(tenantId, today);
        long dueThisWeek = orderRepository.countOrdersDueBetween(tenantId, today, weekEnd);
        long delayed = orderRepository.countDelayedOrders(tenantId, today);
        long inProduction = orderRepository.countByTenantIdAndStatus(tenantId, Order.OrderStatus.IN_PRODUCTION);
        long totalOrders = orderRepository.countByTenantId(tenantId);
        long pending = orderRepository.countByTenantIdAndStatus(tenantId, Order.OrderStatus.RECEIVED)
            + orderRepository.countByTenantIdAndStatus(tenantId, Order.OrderStatus.CONFIRMED);

        ZonedDateTime monthStart = ZonedDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        BigDecimal monthlyRevenue = orderRepository.sumRevenueForPeriod(tenantId, monthStart, ZonedDateTime.now());

        // Status breakdown
        List<Object[]> statusCounts = orderRepository.countByStatus(tenantId);
        Map<String, Long> statusBreakdown = new LinkedHashMap<>();
        for (Order.OrderStatus s : Order.OrderStatus.values()) {
            statusBreakdown.put(s.name(), 0L);
        }
        statusCounts.forEach(row -> statusBreakdown.put((String) row[0], (Long) row[1]));

        long lowStockAlerts = 0; // Will be populated by inventory service

        return new DashboardResponse(
            totalOrders, pending, inProduction, delayed,
            dueToday, dueThisWeek, monthlyRevenue, statusBreakdown, lowStockAlerts
        );
    }

    private String generateOrderNumber(UUID tenantId) {
        String prefix = "CF";
        String year = String.valueOf(Year.now().getValue()).substring(2);
        String month = String.format("%02d", LocalDate.now().getMonthValue());
        long count = orderRepository.countByTenantId(tenantId) + 1;
        return String.format("%s%s%s%04d", prefix, year, month, count);
    }

    public OrderResponse toResponse(Order order) {
        List<OrderResponse.OrderItemResponse> items = order.getItems().stream()
            .map(item -> new OrderResponse.OrderItemResponse(
                item.getId(), item.getProductName(), item.getProductSku(),
                item.getQuantity(), item.getUnitPrice(), item.getDiscountPercent(), item.getLineTotal(),
                item.getCustomizationNotes(), item.getProductionStatus(),
                item.getProduct() != null ? item.getProduct().getId() : null
            ))
            .collect(Collectors.toList());

        List<OrderResponse.StatusHistoryResponse> history = order.getStatusHistory().stream()
            .map(h -> new OrderResponse.StatusHistoryResponse(
                h.getFromStatus(), h.getToStatus(),
                h.getChangedBy() != null ? h.getChangedBy().getFullName() : "System",
                h.getNotes(), h.getCreatedAt()
            ))
            .collect(Collectors.toList());

        String customerName = null;
        String customerPhone = null;
        if (order.getCustomer() != null) {
            customerName = order.getCustomer().getFullName();
            customerPhone = order.getCustomer().getPhone();
        }

        boolean isDelayed = order.getDeliveryDate() != null
            && LocalDate.now().isAfter(order.getDeliveryDate())
            && order.getStatus() != Order.OrderStatus.DELIVERED
            && order.getStatus() != Order.OrderStatus.CANCELLED;

        return new OrderResponse(
            order.getId(), order.getOrderNumber(),
            order.getCustomer() != null ? order.getCustomer().getId() : null,
            customerName, customerPhone,
            order.getStatus().name(), order.getPaymentStatus().name(),
            order.getSubtotal(), order.getDiscountAmount(), order.getTaxAmount(),
            order.getShippingAmount(), order.getTotalAmount(), order.getAmountPaid(),
            order.getCurrency(), order.getDeliveryDate(), order.getDeliveredAt(),
            order.getNotes(), order.getIsRushOrder(), order.getPriority(),
            isDelayed, items, history,
            order.getCreatedAt(), order.getUpdatedAt()
        );
    }
}
