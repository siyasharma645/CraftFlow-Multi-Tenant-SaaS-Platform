package com.craftflow.controller;

import com.craftflow.dto.request.CreateOrderRequest;
import com.craftflow.dto.request.UpdateOrderStatusRequest;
import com.craftflow.dto.response.DashboardResponse;
import com.craftflow.dto.response.OrderResponse;
import com.craftflow.entity.Order;
import com.craftflow.security.UserPrincipal;
import com.craftflow.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('OWNER','STAFF')")
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(orderService.getDashboard());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','STAFF')")
    public ResponseEntity<Page<OrderResponse>> getOrders(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) UUID customerId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime to,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Order.OrderStatus statusEnum = status != null ? Order.OrderStatus.valueOf(status) : null;
        return ResponseEntity.ok(orderService.getOrders(statusEnum, customerId, from, to,
            PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/queue")
    @PreAuthorize("hasAnyRole('OWNER','STAFF')")
    public ResponseEntity<List<OrderResponse>> getProductionQueue() {
        return ResponseEntity.ok(orderService.getProductionQueue());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','STAFF')")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrder(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER','STAFF')")
    public ResponseEntity<OrderResponse> createOrder(
        @Valid @RequestBody CreateOrderRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(orderService.createOrder(request, principal.getId()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('OWNER','STAFF')")
    public ResponseEntity<OrderResponse> updateStatus(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateOrderStatusRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(orderService.updateStatus(id, request, principal.getId()));
    }
}
