package com.craftflow.service;

import com.craftflow.dto.request.SaveCustomerRequest;
import com.craftflow.dto.response.CustomerResponse;
import com.craftflow.entity.*;
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
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final TenantRepository tenantRepository;

    @Transactional
    public CustomerResponse create(SaveCustomerRequest request) {
        UUID tenantId = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findById(tenantId).orElseThrow();

        Customer customer = Customer.builder()
            .tenant(tenant)
            .firstName(request.firstName())
            .lastName(request.lastName())
            .email(request.email())
            .phone(request.phone())
            .whatsapp(request.whatsapp())
            .notes(request.notes())
            .build();

        if (request.address() != null) {
            CustomerAddress addr = CustomerAddress.builder()
                .customer(customer)
                .tenant(tenant)
                .label("Home")
                .addressLine1(request.address().addressLine1())
                .city(request.address().city())
                .state(request.address().state())
                .postalCode(request.address().postalCode())
                .isDefault(true)
                .build();
            customer.getAddresses().add(addr);
        }

        return toResponse(customerRepository.save(customer));
    }

    @Transactional
    public CustomerResponse update(UUID customerId, SaveCustomerRequest request) {
        UUID tenantId = TenantContext.getTenantId();
        Customer customer = customerRepository.findByTenantIdAndId(tenantId, customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer", customerId));

        customer.setFirstName(request.firstName());
        customer.setLastName(request.lastName());
        customer.setEmail(request.email());
        customer.setPhone(request.phone());
        customer.setWhatsapp(request.whatsapp());
        customer.setNotes(request.notes());

        return toResponse(customerRepository.save(customer));
    }

    @Transactional(readOnly = true)
    public Page<CustomerResponse> getAll(String search, Pageable pageable) {
        UUID tenantId = TenantContext.getTenantId();
        return customerRepository.search(tenantId, search, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CustomerResponse getOne(UUID customerId) {
        UUID tenantId = TenantContext.getTenantId();
        return customerRepository.findByTenantIdAndId(tenantId, customerId)
            .map(this::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Customer", customerId));
    }

    @Transactional
    public void delete(UUID customerId) {
        UUID tenantId = TenantContext.getTenantId();
        Customer customer = customerRepository.findByTenantIdAndId(tenantId, customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer", customerId));
        customer.setIsActive(false);
        customerRepository.save(customer);
    }

    public CustomerResponse toResponse(Customer c) {
        List<CustomerResponse.AddressResponse> addresses = c.getAddresses().stream()
            .map(a -> new CustomerResponse.AddressResponse(
                a.getId(), a.getLabel(), a.getAddressLine1(), a.getAddressLine2(),
                a.getCity(), a.getState(), a.getPostalCode(), a.getCountry(), a.getIsDefault()
            )).collect(Collectors.toList());

        return new CustomerResponse(
            c.getId(), c.getFirstName(), c.getLastName(), c.getFullName(),
            c.getEmail(), c.getPhone(), c.getWhatsapp(),
            c.getNotes(), c.getTotalOrders(), c.getTotalSpent(),
            c.getAverageOrderValue(), c.getLastOrderAt(),
            c.getIsActive(), addresses, c.getCreatedAt()
        );
    }
}
