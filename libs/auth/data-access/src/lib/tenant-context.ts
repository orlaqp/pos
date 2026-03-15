type TenantContext = {
    tenantId: string;
    businessName?: string;
};

let currentTenantContext: TenantContext | undefined;

export const setCurrentTenantContext = (context: TenantContext) => {
    currentTenantContext = context;
};

export const clearCurrentTenantContext = () => {
    currentTenantContext = undefined;
};

export const getCurrentTenantContext = () => currentTenantContext;

export const getCurrentTenantId = () => currentTenantContext?.tenantId;

export const requireCurrentTenantId = () => {
    const tenantId = currentTenantContext?.tenantId;

    if (!tenantId && process.env.NODE_ENV === 'test') {
        return 'test-tenant';
    }

    if (!tenantId) {
        throw new Error('Tenant context is not available');
    }

    return tenantId;
};

export const stampTenant = <T extends object>(input: T) => ({
    ...input,
    tenantId: requireCurrentTenantId(),
});
