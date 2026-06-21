package com.craftflow.controller;

import com.craftflow.dto.request.InventoryTransactionRequest;
import com.craftflow.dto.request.SaveInventoryRequest;
import com.craftflow.dto.response.InventoryResponse;
import com.craftflow.security.UserPrincipal;
import com.craftflow.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER','STAFF')")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<Page<InventoryResponse>> getAll(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(inventoryService.getAll(
            PageRequest.of(page, size, Sort.by("name").ascending())));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryResponse>> getLowStock() {
        return ResponseEntity.ok(inventoryService.getLowStock());
    }

    @PostMapping
    public ResponseEntity<InventoryResponse> create(@Valid @RequestBody SaveInventoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.createItem(request));
    }

    @PostMapping("/{id}/transactions")
    public ResponseEntity<InventoryResponse> adjustStock(
        @PathVariable UUID id,
        @Valid @RequestBody InventoryTransactionRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(inventoryService.adjustStock(id, request, principal.getId()));
    }
}
