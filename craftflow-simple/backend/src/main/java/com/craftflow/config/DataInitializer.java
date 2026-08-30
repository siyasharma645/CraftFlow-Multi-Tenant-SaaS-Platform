package com.craftflow.config;

import com.craftflow.entity.*;
import com.craftflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void run(String... args) {
        // Seed roles
        Role ownerRole = roleRepository.findByName("ROLE_OWNER")
            .orElseGet(() -> roleRepository.save(new Role(null, "ROLE_OWNER")));
        roleRepository.findByName("ROLE_STAFF")
            .orElseGet(() -> roleRepository.save(new Role(null, "ROLE_STAFF")));
        roleRepository.findByName("ROLE_CUSTOMER")
            .orElseGet(() -> roleRepository.save(new Role(null, "ROLE_CUSTOMER")));

        log.info("CraftFlow started with H2 in-memory database.");
        log.info("Register at /register to create your business workspace.");
        log.info("H2 Console available at /api/h2-console");
    }
}
