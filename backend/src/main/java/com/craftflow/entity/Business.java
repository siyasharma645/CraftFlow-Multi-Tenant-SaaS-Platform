package com.craftflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.ZonedDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "businesses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Business {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, unique = true)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String businessType;

    @Column(length = 500)
    private String logoUrl;

    @Column(length = 500)
    private String bannerUrl;

    @Column(length = 255)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 255)
    private String website;

    private String addressLine1;
    private String addressLine2;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 20)
    private String postalCode;

    @Column(length = 100)
    @Builder.Default
    private String country = "India";

    @Column(length = 10)
    @Builder.Default
    private String currency = "INR";

    @Column(length = 100)
    @Builder.Default
    private String timezone = "Asia/Kolkata";

    @Column(length = 100)
    private String taxNumber;

    @Column(length = 255)
    private String bankAccountName;

    @Column(length = 50)
    private String bankAccountNumber;

    @Column(length = 20)
    private String bankIfsc;

    @Column(length = 100)
    private String upiId;

    @Column(length = 255)
    private String socialInstagram;

    @Column(length = 255)
    private String socialFacebook;

    @Column(length = 20)
    private String socialWhatsapp;

    @Builder.Default
    private Integer productionCapacityPerDay = 10;

    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private Map<String, Object> settings = Map.of();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private ZonedDateTime updatedAt;

    public UUID getTenantId() {
        return tenant != null ? tenant.getId() : null;
    }
}
