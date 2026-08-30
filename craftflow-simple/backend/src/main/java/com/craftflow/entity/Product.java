package com.craftflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(length = 100)
    private String sku;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String shortDescription;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(precision = 12, scale = 2)
    private BigDecimal costPrice;

    @Column(precision = 12, scale = 2)
    private BigDecimal salePrice;

    @Column(length = 50)
    @Builder.Default
    private String unit = "piece";

    @Column(precision = 8, scale = 2)
    private BigDecimal weightGrams;

    @Column(length = 100)
    private String dimensions;

    @Builder.Default
    private Integer productionTimeHours = 24;

    @Builder.Default
    private Integer minimumOrderQuantity = 1;

    private Integer maximumOrderQuantity;

    @Column(nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;

    @Builder.Default
    private Integer lowStockThreshold = 5;

    @Column(nullable = false)
    @Builder.Default
    private Boolean trackInventory = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean allowCustomOrders = false;

    @JdbcTypeCode(SqlTypes.ARRAY)
    private String[] tags;

    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private List<ProductImage> images = List.of();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private ZonedDateTime updatedAt;

    public UUID getTenantId() {
        return tenant != null ? tenant.getId() : null;
    }

    public boolean isLowStock() {
        return trackInventory && stockQuantity <= lowStockThreshold;
    }

    @Embeddable
    public record ProductImage(String url, String altText, Boolean isPrimary, Integer sortOrder) {}
}
