package com.craftflow.controller;

import com.craftflow.entity.Business;
import com.craftflow.exception.ResourceNotFoundException;
import com.craftflow.repository.BusinessRepository;
import com.craftflow.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/business")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessRepository businessRepository;

    @GetMapping
    public ResponseEntity<Business> getBusiness() {
        return businessRepository.findByTenantId(TenantContext.getTenantId())
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new ResourceNotFoundException("Business not found"));
    }

    @PatchMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Business> updateBusiness(@RequestBody Map<String, Object> updates) {
        Business business = businessRepository.findByTenantId(TenantContext.getTenantId())
            .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        if (updates.containsKey("name")) business.setName((String) updates.get("name"));
        if (updates.containsKey("description")) business.setDescription((String) updates.get("description"));
        if (updates.containsKey("phone")) business.setPhone((String) updates.get("phone"));
        if (updates.containsKey("email")) business.setEmail((String) updates.get("email"));
        if (updates.containsKey("website")) business.setWebsite((String) updates.get("website"));
        if (updates.containsKey("city")) business.setCity((String) updates.get("city"));
        if (updates.containsKey("state")) business.setState((String) updates.get("state"));
        if (updates.containsKey("upiId")) business.setUpiId((String) updates.get("upiId"));
        if (updates.containsKey("productionCapacityPerDay"))
            business.setProductionCapacityPerDay((Integer) updates.get("productionCapacityPerDay"));

        return ResponseEntity.ok(businessRepository.save(business));
    }
}
