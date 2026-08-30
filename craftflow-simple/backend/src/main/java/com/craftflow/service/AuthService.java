package com.craftflow.service;

import com.craftflow.dto.request.LoginRequest;
import com.craftflow.dto.request.RegisterBusinessRequest;
import com.craftflow.dto.response.AuthResponse;
import com.craftflow.entity.*;
import com.craftflow.exception.BusinessException;
import com.craftflow.exception.ConflictException;
import com.craftflow.exception.ResourceNotFoundException;
import com.craftflow.repository.*;
import com.craftflow.security.JwtTokenProvider;
import com.craftflow.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.Set;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse registerBusiness(RegisterBusinessRequest request) {
        String slug = generateSlug(request.businessName());
        if (tenantRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis() % 10000;
        }

        // Create tenant
        Tenant tenant = tenantRepository.save(Tenant.builder()
            .slug(slug)
            .name(request.businessName())
            .plan(Tenant.Plan.STARTER)
            .build());

        // Check email uniqueness within tenant (new tenant so always unique, but check global)
        if (userRepository.findByEmail(request.email()).isPresent()) {
            // Allow same email across different tenants
        }

        // Get owner role
        Role ownerRole = roleRepository.findByName("ROLE_OWNER")
            .orElseThrow(() -> new ResourceNotFoundException("Role ROLE_OWNER not found"));

        // Create owner user
        User owner = userRepository.save(User.builder()
            .tenant(tenant)
            .email(request.email())
            .passwordHash(passwordEncoder.encode(request.password()))
            .firstName(request.firstName())
            .lastName(request.lastName())
            .phone(request.phone())
            .isEmailVerified(true) // Skip email verification for MVP
            .roles(Set.of(ownerRole))
            .build());

        // Create business profile
        businessRepository.save(Business.builder()
            .tenant(tenant)
            .owner(owner)
            .name(request.businessName())
            .businessType(request.businessType())
            .email(request.email())
            .phone(request.phone())
            .build());

        UserPrincipal principal = new UserPrincipal(userRepository.findById(owner.getId()).orElseThrow());
        String token = jwtTokenProvider.generateToken(principal);

        log.info("New business registered: {} (tenant: {})", request.businessName(), tenant.getSlug());

        return new AuthResponse(token, principal.getId(), tenant.getId(), tenant.getSlug(),
            principal.getFirstName(), principal.getLastName(), principal.getEmail(),
            "ROLE_OWNER", request.businessName());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        String token = jwtTokenProvider.generateToken(principal);

        // Get business name
        String businessName = businessRepository.findByTenantId(principal.getTenantId())
            .map(Business::getName)
            .orElse("");

        String primaryRole = principal.getAuthorities().stream()
            .findFirst()
            .map(a -> a.getAuthority())
            .orElse("ROLE_CUSTOMER");

        return new AuthResponse(token, principal.getId(), principal.getTenantId(),
            principal.getTenantSlug(), principal.getFirstName(), principal.getLastName(),
            principal.getEmail(), primaryRole, businessName);
    }

    private String generateSlug(String name) {
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("")
            .toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("[\\s_]+", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
    }
}
