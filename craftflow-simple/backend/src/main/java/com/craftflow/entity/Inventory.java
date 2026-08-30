package com.craftflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InventoryType type = InventoryType.RAW_MATERIAL;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String sku;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String unit = "piece";

    @Column(nullable = false, precision = 12, scale = 3)
    @Builder.Default
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 3)
    @Builder.Default
    private BigDecimal reservedQuantity = BigDecimal.ZERO;

    @Column(precision = 12, scale = 3)
    @Builder.Default
    private BigDecimal lowStockThreshold = BigDecimal.TEN;

    @Column(precision = 12, scale = 3)
    private BigDecimal reorderQuantity;

    @Column(precision = 12, scale = 2)
    private BigDecimal unitCost;

    @Column(length = 255)
    private String supplierName;

    @Column(length = 255)
    private String supplierContact;

    @Column(length = 255)
    private String location;

    private LocalDate expiryDate;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    private ZonedDateTime lastRestockedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private ZonedDateTime updatedAt;

    public BigDecimal getAvailableQuantity() {
        return quantity.subtract(reservedQuantity);
    }

    public boolean isLowStock() {
        return quantity.compareTo(lowStockThreshold) <= 0;
    }

    public UUID getTenantId() {
        return tenant != null ? tenant.getId() : null;
    }

    public enum InventoryType { RAW_MATERIAL, FINISHED_GOOD, PACKAGING, TOOL }
}
