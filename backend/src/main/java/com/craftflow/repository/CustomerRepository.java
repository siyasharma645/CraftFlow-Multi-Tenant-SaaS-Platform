package com.craftflow.repository;

import com.craftflow.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {

    Optional<Customer> findByTenantIdAndId(UUID tenantId, UUID id);

    Page<Customer> findByTenantId(UUID tenantId, Pageable pageable);

    @Query("""
        SELECT c FROM Customer c
        WHERE c.tenant.id = :tenantId
        AND c.isActive = true
        AND (:search IS NULL OR
             LOWER(c.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
             LOWER(c.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
             LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
             c.phone LIKE CONCAT('%', :search, '%'))
        """)
    Page<Customer> search(
        @Param("tenantId") UUID tenantId,
        @Param("search") String search,
        Pageable pageable
    );

    long countByTenantId(UUID tenantId);

    Optional<Customer> findByTenantIdAndEmail(UUID tenantId, String email);
}
