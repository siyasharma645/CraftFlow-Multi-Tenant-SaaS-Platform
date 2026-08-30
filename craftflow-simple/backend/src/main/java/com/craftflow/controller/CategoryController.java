package com.craftflow.controller;

import com.craftflow.entity.Category;
import com.craftflow.exception.ResourceNotFoundException;
import com.craftflow.repository.CategoryRepository;
import com.craftflow.repository.TenantRepository;
import com.craftflow.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final TenantRepository tenantRepository;

    @GetMapping
    public ResponseEntity<List<Category>> getAll() {
        return ResponseEntity.ok(
            categoryRepository.findByTenantIdAndIsActiveTrueOrderBySortOrderAsc(TenantContext.getTenantId())
        );
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER','STAFF')")
    public ResponseEntity<Category> create(@RequestBody CategoryRequest req) {
        UUID tenantId = TenantContext.getTenantId();
        var tenant = tenantRepository.findById(tenantId).orElseThrow();
        var cat = Category.builder()
            .tenant(tenant)
            .name(req.name())
            .description(req.description())
            .color(req.color() != null ? req.color() : "#6366f1")
            .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryRepository.save(cat));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        categoryRepository.findByTenantIdAndId(TenantContext.getTenantId(), id)
            .ifPresent(c -> { c.setIsActive(false); categoryRepository.save(c); });
        return ResponseEntity.noContent().build();
    }

    record CategoryRequest(String name, String description, String color) {}
}
