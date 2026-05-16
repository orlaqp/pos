'use client';

import { useMemo, useState } from 'react';
import {
    ADMIN_ROUTES,
    AdminRouteId,
    DEFAULT_ADMIN_ROUTE,
    applyProductCatalogChange,
    getAdminConsoleData,
    ProductCatalogChange,
} from '@pos/admin/data-access';
import { AuthGate } from '@pos/auth/web-feature';
import { BrandsWebFeature } from '@pos/brands/web-feature';
import { CategoriesWebFeature } from '@pos/categories/web-feature';
import { InventoryWebFeature } from '@pos/inventory/web-feature';
import { ProductsWebFeature } from '@pos/products/web-feature';
import { ReportingWebFeature } from '@pos/reporting/web-feature';
import { SalesWebFeature } from '@pos/sales/web-feature';
import { AdminLayout, EmptyState, ThemeProvider } from '@pos/shared/ui-web';
import { UnitOfMeasuresWebFeature } from '@pos/unit-of-measures/web-feature';
import { adminNavSections } from './nav-config';
import { TenantSelector } from './tenant-selector';

const MANAGEMENT_PLACEHOLDERS: Partial<Record<AdminRouteId, string>> = {
    [ADMIN_ROUTES.employees]: 'Employee management will reuse employee forms next.',
    [ADMIN_ROUTES.discounts]: 'Discount policy screens will reuse discount domain logic next.',
    [ADMIN_ROUTES.store]: 'Store configuration will reuse store-info data access next.',
    [ADMIN_ROUTES.station]: 'Station configuration will reuse settings data access next.',
    [ADMIN_ROUTES.printers]: 'Printer setup remains native-first until web printer support is defined.',
    [ADMIN_ROUTES.logs]: 'Operational logs will come from admin audit APIs.',
    [ADMIN_ROUTES.settings]: 'Settings modules are grouped under configuration.',
};

const INVENTORY_ROUTES = new Set<AdminRouteId>([
    ADMIN_ROUTES.inventoryStock,
    ADMIN_ROUTES.inventoryCounts,
    ADMIN_ROUTES.inventoryReceives,
]);

export function AdminConsole() {
    const data = useMemo(() => getAdminConsoleData(), []);
    const [activeRoute, setActiveRoute] = useState<AdminRouteId>(DEFAULT_ADMIN_ROUTE);
    const [tenantData, setTenantData] = useState(data.tenantData);
    const [selectedTenant, setSelectedTenant] = useState(data.tenants[0]);
    const [searchValue, setSearchValue] = useState('');
    const activeTenantData = tenantData[selectedTenant.id];

    const applyProductChange = (change: ProductCatalogChange) => {
        setTenantData((current) => ({
            ...current,
            [selectedTenant.id]: {
                ...current[selectedTenant.id],
                catalog: {
                    ...current[selectedTenant.id].catalog,
                    products: applyProductCatalogChange(
                        current[selectedTenant.id].catalog.products,
                        change
                    ),
                },
            },
        }));
    };

    const tenantSelector = (
        <TenantSelector
            selectedTenant={selectedTenant}
            tenants={data.tenants}
            onTenantChange={(tenant) => {
                setSelectedTenant(tenant);
                setSearchValue('');
            }}
        />
    );

    return (
        <ThemeProvider>
            <AuthGate>
                <AdminLayout
                    activeRoute={activeRoute}
                    navSections={adminNavSections}
                    searchValue={searchValue}
                    tenantSelector={tenantSelector}
                    userEmail="super.admin@pos.local"
                    userName="Super Admin"
                    onRouteChange={(route) => {
                        setActiveRoute(route);
                        setSearchValue('');
                    }}
                    onSearchChange={setSearchValue}
                >
                    {renderRoute(activeRoute, selectedTenant.name, activeTenantData, searchValue, applyProductChange)}
                </AdminLayout>
            </AuthGate>
        </ThemeProvider>
    );
}

function renderRoute(
    activeRoute: AdminRouteId,
    tenantName: string,
    data: ReturnType<typeof getAdminConsoleData>['tenantData'][string],
    searchValue: string,
    applyProductChange: (change: ProductCatalogChange) => void
) {
    if (activeRoute === ADMIN_ROUTES.products) {
        return (
            <ProductsWebFeature
                brands={data.catalog.brands}
                categories={data.catalog.categories}
                query={searchValue}
                rows={data.catalog.products}
                units={data.catalog.units}
                onApplyChange={applyProductChange}
            />
        );
    }
    if (activeRoute === ADMIN_ROUTES.categories) return <CategoriesWebFeature query={searchValue} rows={data.catalog.categories} />;
    if (activeRoute === ADMIN_ROUTES.brands) return <BrandsWebFeature query={searchValue} rows={data.catalog.brands} />;
    if (activeRoute === ADMIN_ROUTES.units) return <UnitOfMeasuresWebFeature query={searchValue} rows={data.catalog.units} />;
    if (INVENTORY_ROUTES.has(activeRoute)) {
        return <InventoryWebFeature products={data.catalog.products} query={searchValue} route={activeRoute} />;
    }
    if (activeRoute === ADMIN_ROUTES.saleList) return <SalesWebFeature query={searchValue} sales={data.dashboard.recentSales} />;
    if (MANAGEMENT_PLACEHOLDERS[activeRoute]) {
        return <EmptyState title={routeTitle(activeRoute)} description={MANAGEMENT_PLACEHOLDERS[activeRoute] || ''} />;
    }
    return <ReportingWebFeature dashboard={data.dashboard} query={searchValue} route={activeRoute} tenantName={tenantName} />;
}

function routeTitle(route: AdminRouteId) {
    return route
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}
