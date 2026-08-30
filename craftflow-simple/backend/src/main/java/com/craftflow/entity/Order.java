package com.craftflow.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false, length = 50)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.RECEIVED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(length = 50)
    private String paymentMethod;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal shippingAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String currency = "INR";

    private LocalDate deliveryDate;

    private ZonedDateTime deliveredAt;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> shippingAddress;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT")
    private String customerNotes;

    @Column(columnDefinition = "TEXT")
    private String internalNotes;

    @Column(nullable = false)
    @Builder.Default
    private Integer priority = 5;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isRushOrder = false;

    @Column(length = 50)
    @Builder.Default
    private String source = "MANUAL";

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<OrderStatusHistory> statusHistory = new ArrayList<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private ZonedDateTime updatedAt;

    public UUID getTenantId() {
        return tenant != null ? tenant.getId() : null;
    }

    public enum OrderStatus {
        RECEIVED, CONFIRMED, MATERIALS_READY, IN_PRODUCTION,
        QUALITY_CHECK, READY_TO_SHIP, DELIVERED, CANCELLED;

        public boolean canTransitionTo(OrderStatus next) {
            return switch (this) {
                case RECEIVED -> next == CONFIRMED || next == CANCELLED;
                case CONFIRMED -> next == MATERIALS_READY || next == CANCELLED;
                case MATERIALS_READY -> next == IN_PRODUCTION || next == CANCELLED;
                case IN_PRODUCTION -> next == QUALITY_CHECK || next == CANCELLED;
                case QUALITY_CHECK -> next == READY_TO_SHIP || next == IN_PRODUCTION;
                case READY_TO_SHIP -> next == DELIVERED;
                case DELIVERED, CANCELLED -> false;
            };
        }
    }

    public enum PaymentStatus { PENDING, PARTIAL, PAID, REFUNDED, FAILED }
}
