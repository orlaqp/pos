import type { BrandEntity } from '../../../../brands/data-access/src/lib/brand.entity';
import type { CategoryEntity } from '../../../../categories/data-access/src/lib/category.entity';
import type { ProductEntity } from '../../../../products/data-access/src/lib/product.entity';
import type { UnitOfMeasureEntity } from '../../../../unit-of-measures/data-access/src/lib/unit-of-measure.entity';

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
