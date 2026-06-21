package com.craftflow.security;

import java.util.UUID;

public class TenantContext {

    private static final ThreadLocal<UUID> TENANT_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> TENANT_SLUG = new ThreadLocal<>();

    public static void setTenantId(UUID tenantId) {
        TENANT_ID.set(tenantId);
    }

    public static UUID getTenantId() {
        return TENANT_ID.get();
    }

    public static void setTenantSlug(String slug) {
        TENANT_SLUG.set(slug);
    }

    public static String getTenantSlug() {
        return TENANT_SLUG.get();
    }

    public static void clear() {
        TENANT_ID.remove();
        TENANT_SLUG.remove();
    }

    public static boolean hasTenant() {
        return TENANT_ID.get() != null;
    }
}
