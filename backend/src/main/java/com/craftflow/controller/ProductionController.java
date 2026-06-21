package com.craftflow.controller;

import com.craftflow.dto.response.ProductionQueueResponse;
import com.craftflow.service.ProductionSchedulingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/production")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER','STAFF')")
public class ProductionController {

    private final ProductionSchedulingService productionSchedulingService;

    @GetMapping("/plan")
    public ResponseEntity<ProductionQueueResponse> getProductionPlan() {
        return ResponseEntity.ok(productionSchedulingService.getProductionPlan());
    }
}
