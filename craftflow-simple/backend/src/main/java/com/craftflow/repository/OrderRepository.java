package com.craftflow.repository;

import com.craftflow.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    Optional<Order> findByTenantIdAndId(UUID tenantId, UUID id);

    Optional<Order> findByTenantIdAndOrderNumber(UUID tenantId, String orderNumber);

    Page<Order> findByTenantId(UUID tenantId, Pageable pageable);

    @Query("""
        SELECT o FROM Order o
        WHERE o.tenant.id = :tenantId
        AND (:status IS NULL OR o.status = :status)
        AND (:customerId IS NULL OR o.customer.id = :customerId)
        AND (:from IS NULL OR o.createdAt >= :from)
        AND (:to IS NULL OR o.createdAt <= :to)
        ORDER BY o.createdAt DESC
        """)
    Page<Order> search(
        @Param("tenantId") UUID tenantId,
        @Param("status") Order.OrderStatus status,
        @Param("customerId") UUID customerId,
        @Param("from") ZonedDateTime from,
        @Param("to") ZonedDateTime to,
        Pageable pageable
    );

    @Query("SELECT COUNT(o) FROM Order o WHERE o.tenant.id = :tenantId AND o.deliveryDate = :date AND o.status NOT IN ('DELIVERED', 'CANCELLED')")
    long countOrdersDueOn(@Param("tenantId") UUID tenantId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.tenant.id = :tenantId AND o.deliveryDate BETWEEN :from AND :to AND o.status NOT IN ('DELIVERED', 'CANCELLED')")
    long countOrdersDueBetween(@Param("tenantId") UUID tenantId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.tenant.id = :tenantId AND o.deliveryDate < :today AND o.status NOT IN ('DELIVERED', 'CANCELLED')")
    long countDelayedOrders(@Param("tenantId") UUID tenantId, @Param("today") LocalDate today);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.tenant.id = :tenantId AND o.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") Order.OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.tenant.id = :tenantId AND o.status = 'DELIVERED' AND o.createdAt >= :from AND o.createdAt <= :to")
    BigDecimal sumRevenueForPeriod(@Param("tenantId") UUID tenantId, @Param("from") ZonedDateTime from, @Param("to") ZonedDateTime to);

    @Query("""
        SELECT o FROM Order o
        WHERE o.tenant.id = :tenantId
        AND o.status NOT IN ('DELIVERED', 'CANCELLED')
        ORDER BY o.priority DESC, o.deliveryDate ASC NULLS LAST
        """)
    List<Order> findProductionQueue(@Param("tenantId") UUID tenantId);

    @Query("""
        SELECT o.status as status, COUNT(o) as count
        FROM Order o
        WHERE o.tenant.id = :tenantId
        GROUP BY o.status
        """)
    List<Object[]> countByStatus(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.tenant.id = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);
}
