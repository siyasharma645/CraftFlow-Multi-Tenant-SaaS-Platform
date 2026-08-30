package com.craftflow.service;

import com.craftflow.entity.*;
import com.craftflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;

    @Async
    @Transactional
    public void sendOrderNotification(Order order, String type) {
        try {
            UUID tenantId = order.getTenantId();
            // Notify business owner
            businessRepository.findByTenantId(tenantId).ifPresent(business -> {
                String title = getNotificationTitle(type, order.getOrderNumber());
                String message = getNotificationMessage(type, order);

                Notification notification = Notification.builder()
                    .tenant(order.getTenant())
                    .user(business.getOwner())
                    .type(type)
                    .title(title)
                    .message(message)
                    .referenceType("ORDER")
                    .referenceId(order.getId())
                    .build();

                notificationRepository.save(notification);
            });
        } catch (Exception e) {
            log.error("Failed to send notification for order {}", order.getId(), e);
        }
    }

    @Async
    @Transactional
    public void sendLowStockAlert(Inventory item) {
        try {
            UUID tenantId = item.getTenantId();
            businessRepository.findByTenantId(tenantId).ifPresent(business -> {
                Notification notification = Notification.builder()
                    .tenant(item.getTenant())
                    .user(business.getOwner())
                    .type("LOW_STOCK_ALERT")
                    .title("Low Stock Alert")
                    .message(String.format("%s is running low. Current stock: %.2f %s",
                        item.getName(), item.getQuantity(), item.getUnit()))
                    .referenceType("INVENTORY")
                    .referenceId(item.getId())
                    .build();

                notificationRepository.save(notification);
            });
        } catch (Exception e) {
            log.error("Failed to send low stock notification for item {}", item.getId(), e);
        }
    }

    @Transactional(readOnly = true)
    public Page<Notification> getNotifications(UUID tenantId, UUID userId, Pageable pageable) {
        return notificationRepository.findByTenantIdAndUserIdOrderByCreatedAtDesc(tenantId, userId, pageable);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID tenantId, UUID userId) {
        return notificationRepository.countByTenantIdAndUserIdAndIsReadFalse(tenantId, userId);
    }

    @Transactional
    public void markAllAsRead(UUID tenantId, UUID userId) {
        notificationRepository.markAllAsRead(tenantId, userId);
    }

    private String getNotificationTitle(String type, String orderNumber) {
        return switch (type) {
            case "NEW_ORDER" -> "New Order Received: #" + orderNumber;
            case "STATUS_CHANGED" -> "Order Status Updated: #" + orderNumber;
            default -> "Order Update: #" + orderNumber;
        };
    }

    private String getNotificationMessage(String type, Order order) {
        return switch (type) {
            case "NEW_ORDER" -> String.format("Order #%s has been placed for ₹%.2f",
                order.getOrderNumber(), order.getTotalAmount());
            case "STATUS_CHANGED" -> String.format("Order #%s status changed to %s",
                order.getOrderNumber(), order.getStatus().name().replace("_", " "));
            default -> "Order #" + order.getOrderNumber() + " has been updated";
        };
    }
}
