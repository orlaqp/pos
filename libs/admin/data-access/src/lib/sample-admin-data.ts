import type { AdminConsoleData, AdminTenantData } from './admin-types';

const mainTenant: AdminTenantData = {
    dashboard: {
        metrics: [
            { id: 'revenue', title: 'Total Revenue', value: '$45,231.89', detail: '+20.1% from last month', tone: 'positive' },
            { id: 'sales', title: 'Total Sales', value: '2,350', detail: '+12.5% from last month', tone: 'positive' },
            { id: 'orders', title: 'Open Orders', value: '18', detail: 'Across selected tenant', tone: 'neutral' },
            { id: 'stock', title: 'Products in Stock', value: '1,234', detail: '5 below reorder point', tone: 'warning' },
        ],
        recentSales: [
            { id: 'sale-1', orderNo: '1234', amount: '$250.00', timeAgo: '2 mins ago' },
            { id: 'sale-2', orderNo: '1235', amount: '$150.50', timeAgo: '5 mins ago' },
            { id: 'sale-3', orderNo: '1236', amount: '$350.00', timeAgo: '12 mins ago' },
            { id: 'sale-4', orderNo: '1237', amount: '$450.25', timeAgo: '23 mins ago' },
        ],
        salesTrend: [
            { label: 'Mon', amount: 1200 },
            { label: 'Tue', amount: 2100 },
            { label: 'Wed', amount: 1800 },
            { label: 'Thu', amount: 2600 },
            { label: 'Fri', amount: 3100 },
        ],
    },
    catalog: {
        products: [
            { id: 'p1', name: 'Organic Olive Oil', description: 'Imported 1L bottle', price: 14.99, tags: 'grocery', cost: 8.25, barcode: '073430005044', sku: 'OO-1L', plu: null, quantity: 42, unitOfMeasure: 'ea', trackStock: true, reorderPoint: 12, reorderQuantity: 24, picture: null, productCategoryId: 'c1', productBrandId: 'b1', minAllowedPrice: null, maxManualDiscountPercent: 15, maxManualDiscountAmount: null, isActive: true, isEBTEligible: true },
            { id: 'p2', name: 'Bulk Jasmine Rice', description: '25 lb bag', price: 31.5, tags: 'bulk', cost: 21, barcode: null, sku: 'RICE-25', plu: null, quantity: 9, unitOfMeasure: 'ea', trackStock: true, reorderPoint: 10, reorderQuantity: 20, picture: null, productCategoryId: 'c2', productBrandId: 'b2', minAllowedPrice: null, maxManualDiscountPercent: 10, maxManualDiscountAmount: null, isActive: true, isEBTEligible: true },
        ],
        categories: [
            { id: 'c1', name: 'Grocery', description: 'Shelf-stable grocery items', code: 'GROC', color: '#2f6fed', discountable: true },
            { id: 'c2', name: 'Bulk', description: 'Bulk packaged goods', code: 'BULK', color: '#6750a4', discountable: true },
        ],
        brands: [
            { id: 'b1', name: 'Market Select', description: 'House premium line' },
            { id: 'b2', name: 'Pantry Value', description: 'Value staples' },
        ],
        units: [
            { id: 'u1', name: 'ea', description: 'Each' },
            { id: 'u2', name: 'lb', description: 'Pound' },
        ],
    },
};

const branchTenant = {
    ...mainTenant,
    dashboard: {
        ...mainTenant.dashboard,
        metrics: [
            { id: 'revenue', title: 'Total Revenue', value: '$18,420.50', detail: '+8.4% from last month', tone: 'positive' as const },
            { id: 'sales', title: 'Total Sales', value: '940', detail: '+4.2% from last month', tone: 'positive' as const },
            { id: 'orders', title: 'Open Orders', value: '7', detail: 'Across selected tenant', tone: 'neutral' as const },
            { id: 'stock', title: 'Products in Stock', value: '682', detail: '2 below reorder point', tone: 'warning' as const },
        ],
    },
};

export const sampleAdminData: AdminConsoleData = {
    tenants: [
        { id: 'tenant-main', name: 'Main Store', location: 'New York, NY', status: 'active' },
        { id: 'tenant-west', name: 'West Branch', location: 'Los Angeles, CA', status: 'active' },
        { id: 'tenant-east', name: 'East Branch', location: 'Miami, FL', status: 'setup' },
    ],
    tenantData: {
        'tenant-main': mainTenant,
        'tenant-west': branchTenant,
        'tenant-east': {
            ...branchTenant,
            catalog: {
                ...branchTenant.catalog,
                products: branchTenant.catalog.products.slice(0, 1),
            },
        },
    },
};
