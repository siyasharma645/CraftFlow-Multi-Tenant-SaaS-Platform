package com.craftflow.service;

import com.craftflow.dto.request.SaveProductRequest;
import com.craftflow.dto.response.ProductResponse;
import com.craftflow.entity.*;
import com.craftflow.exception.ConflictException;
import com.craftflow.exception.ResourceNotFoundException;
import com.craftflow.repository.*;
import com.craftflow.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final TenantRepository tenantRepository;

    @Transactional
    public ProductResponse create(SaveProductRequest request) {
        UUID tenantId = TenantContext.getTenantId();

        if (request.sku() != null && productRepository.existsByTenantIdAndSku(tenantId, request.sku())) {
            throw new ConflictException("Product with SKU '" + request.sku() + "' already exists");
        }

        Tenant tenant = tenantRepository.findById(tenantId).orElseThrow();
        Category category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findByTenantIdAndId(tenantId, request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.categoryId()));
        }

        Product product = Product.builder()
            .tenant(tenant)
            .category(category)
            .sku(request.sku())
            .name(request.name())
            .description(request.description())
            .shortDescription(request.shortDescription())
            .price(request.price())
            .costPrice(request.costPrice())
            .unit(request.unit() != null ? request.unit() : "piece")
            .productionTimeHours(request.productionTimeHours() != null ? request.productionTimeHours() : 24)
            .stockQuantity(request.stockQuantity() != null ? request.stockQuantity() : 0)
            .lowStockThreshold(request.lowStockThreshold() != null ? request.lowStockThreshold() : 5)
            .trackInventory(request.trackInventory() == null || request.trackInventory())
            .isActive(true)
            .allowCustomOrders(request.allowCustomOrders() != null && request.allowCustomOrders())
            .build();

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(UUID productId, SaveProductRequest request) {
        UUID tenantId = TenantContext.getTenantId();
        Product product = productRepository.findByTenantIdAndId(tenantId, productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        product.setName(request.name());
        product.setDescription(request.description());
        product.setShortDescription(request.shortDescription());
        product.setPrice(request.price());
        product.setCostPrice(request.costPrice());
        if (request.stockQuantity() != null) product.setStockQuantity(request.stockQuantity());
        if (request.lowStockThreshold() != null) product.setLowStockThreshold(request.lowStockThreshold());
        if (request.productionTimeHours() != null) product.setProductionTimeHours(request.productionTimeHours());

        if (request.categoryId() != null) {
            categoryRepository.findByTenantIdAndId(tenantId, request.categoryId())
                .ifPresent(product::setCategory);
        }

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void delete(UUID productId) {
        UUID tenantId = TenantContext.getTenantId();
        Product product = productRepository.findByTenantIdAndId(tenantId, productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
        product.setIsActive(false);
        productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAll(UUID categoryId, String search, Pageable pageable) {
        UUID tenantId = TenantContext.getTenantId();
        return productRepository.search(tenantId, categoryId, search, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getOne(UUID productId) {
        UUID tenantId = TenantContext.getTenantId();
        return productRepository.findByTenantIdAndId(tenantId, productId)
            .map(this::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStock() {
        UUID tenantId = TenantContext.getTenantId();
        return productRepository.findLowStockProducts(tenantId).stream()
            .map(this::toResponse).collect(Collectors.toList());
    }

    public ProductResponse toResponse(Product p) {
        return new ProductResponse(
            p.getId(), p.getSku(), p.getName(), p.getDescription(), p.getShortDescription(),
            p.getPrice(), p.getCostPrice(), p.getSalePrice(), p.getUnit(),
            p.getProductionTimeHours(), p.getStockQuantity(), p.getLowStockThreshold(),
            p.getTrackInventory(), p.getIsActive(), p.getIsFeatured(), p.getAllowCustomOrders(),
            p.isLowStock(),
            p.getCategory() != null ? p.getCategory().getId() : null,
            p.getCategory() != null ? p.getCategory().getName() : null,
            p.getCategory() != null ? p.getCategory().getColor() : null,
            p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}
