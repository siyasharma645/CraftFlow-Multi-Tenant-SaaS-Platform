package com.craftflow.repository;

import com.craftflow.entity.InventoryTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, UUID> {
    Page<InventoryTransaction> findByTenantIdAndInventoryIdOrderByCreatedAtDesc(UUID tenantId, UUID inventoryId, Pageable pageable);
    Page<InventoryTransaction> findByTenantIdOrderByCreatedAtDesc(UUID tenantId, Pageable pageable);
}
