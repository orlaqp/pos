import type { BrandEntity } from '@pos/brands/data-access/entities';
import type { CategoryEntity } from '@pos/categories/data-access/entities';
import type { ProductEntity } from '@pos/products/data-access/entities';
import type { UnitOfMeasureEntity } from '@pos/unit-of-measures/data-access/entities';

export type TenantSummary = {
    id: string;
    name: string;
    location: string;
    status: 'active' | 'setup' | 'paused';
};

export type DashboardMetric = {
    id: string;
    title: string;
    value: string;
    detail: string;
    tone: 'neutral' | 'positive' | 'warning';
};

export type RecentSale = {
    id: string;
    orderNo: string;
    amount: string;
    timeAgo: string;
};

export type AdminCatalogData = {
    products: ProductEntity[];
    categories: CategoryEntity[];
    brands: BrandEntity[];
    units: UnitOfMeasureEntity[];
};

export type DirectoryContact = {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    companyId: string | null;
    role: string | null;
    status: 'active' | 'review';
};

export type DirectoryCompany = {
    id: string;
    name: string;
    type: string | null;
    primaryContactId: string | null;
    status: 'active' | 'review';
};

export type CatalogVendor = {
    id: string;
    name: string;
    companyId: string | null;
    primaryContactId: string | null;
    terms: string | null;
    status: 'active' | 'review';
};

export type AdminDirectoryData = {
    contacts: DirectoryContact[];
    companies: DirectoryCompany[];
    vendors: CatalogVendor[];
};

export type AdminDashboardData = {
    metrics: DashboardMetric[];
    recentSales: RecentSale[];
    salesTrend: Array<{ label: string; amount: number }>;
};

export type AdminConsoleData = {
    tenants: TenantSummary[];
    tenantData: Record<string, AdminTenantData>;
};

export type AdminTenantData = {
    dashboard: AdminDashboardData;
    catalog: AdminCatalogData;
    directory: AdminDirectoryData;
};

export type ProductCatalogChange = {
    productId: string;
    name: string;
    description: string | null;
    cost: number | null;
    price: number;
    barcode: string | null;
    sku: string | null;
    plu: string | null;
    unitOfMeasure: string;
    quantity: number;
    trackStock: boolean;
    reorderPoint: number | null;
    reorderQuantity: number | null;
    productCategoryId: string | null;
    productBrandId: string | null;
    isActive: boolean;
    isEBTEligible: boolean;
};

export type CatalogChangePreview = {
    entityName: string;
    fields: Array<{ label: string; before: string; after: string }>;
};
