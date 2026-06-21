package com.craftflow.repository;

import com.craftflow.entity.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    Optional<Inventory> findByTenantIdAndId(UUID tenantId, UUID id);

    Page<Inventory> findByTenantId(UUID tenantId, Pageable pageable);

    @Query("SELECT i FROM Inventory i WHERE i.tenant.id = :tenantId AND i.isActive = true AND i.quantity <= i.lowStockThreshold")
    List<Inventory> findLowStockItems(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.tenant.id = :tenantId AND i.isActive = true AND i.quantity <= i.lowStockThreshold")
    long countLowStockItems(@Param("tenantId") UUID tenantId);

    Page<Inventory> findByTenantIdAndType(UUID tenantId, Inventory.InventoryType type, Pageable pageable);
}
