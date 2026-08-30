package com.craftflow.repository;

import com.craftflow.entity.Product;
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
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findByTenantIdAndId(UUID tenantId, UUID id);

    Page<Product> findByTenantIdAndIsActiveTrue(UUID tenantId, Pageable pageable);

    @Query("""
        SELECT p FROM Product p
        WHERE p.tenant.id = :tenantId
        AND p.isActive = true
        AND (:categoryId IS NULL OR p.category.id = :categoryId)
        AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))
        """)
    Page<Product> search(
        @Param("tenantId") UUID tenantId,
        @Param("categoryId") UUID categoryId,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("SELECT p FROM Product p WHERE p.tenant.id = :tenantId AND p.trackInventory = true AND p.stockQuantity <= p.lowStockThreshold AND p.isActive = true")
    List<Product> findLowStockProducts(@Param("tenantId") UUID tenantId);

    long countByTenantIdAndIsActiveTrue(UUID tenantId);

    boolean existsByTenantIdAndSku(UUID tenantId, String sku);
}
