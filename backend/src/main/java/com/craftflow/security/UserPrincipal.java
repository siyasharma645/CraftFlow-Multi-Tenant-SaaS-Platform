package com.craftflow.security;

import com.craftflow.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.UUID;
import java.util.stream.Collectors;

@Getter
public class UserPrincipal implements UserDetails {

    private final UUID id;
    private final UUID tenantId;
    private final String tenantSlug;
    private final String email;
    private final String password;
    private final String firstName;
    private final String lastName;
    private final boolean enabled;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(User user) {
        this.id = user.getId();
        this.tenantId = user.getTenantId();
        this.tenantSlug = user.getTenant().getSlug();
        this.email = user.getEmail();
        this.password = user.getPasswordHash();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.enabled = user.getIsActive();
        this.authorities = user.getRoles().stream()
            .map(role -> new SimpleGrantedAuthority(role.getName()))
            .collect(Collectors.toSet());
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return enabled; }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public boolean hasRole(String role) {
        return authorities.stream()
            .anyMatch(a -> a.getAuthority().equals(role));
    }

    public boolean isOwner() {
        return hasRole("ROLE_OWNER");
    }

    public boolean isStaff() {
        return hasRole("ROLE_STAFF") || isOwner();
    }
}
