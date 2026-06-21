package com.craftflow.repository;

import com.craftflow.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findByTenantIdAndUserIdOrderByCreatedAtDesc(UUID tenantId, UUID userId, Pageable pageable);

    long countByTenantIdAndUserIdAndIsReadFalse(UUID tenantId, UUID userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.tenant.id = :tenantId AND n.user.id = :userId AND n.isRead = false")
    void markAllAsRead(@Param("tenantId") UUID tenantId, @Param("userId") UUID userId);
}
