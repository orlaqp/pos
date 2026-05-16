import {
    ClipboardList,
    FileSpreadsheet,
    FileText,
    Grid3x3,
    LayoutDashboard,
    Layers,
    Monitor,
    Package,
    PackageCheck,
    PackageOpen,
    Percent,
    Printer,
    Receipt,
    Ruler,
    Settings,
    ShoppingCart,
    Store,
    Tag,
    Users,
} from 'lucide-react';
import { ADMIN_ROUTES, AdminRouteId } from '@pos/admin/data-access';
import { NavSection } from '@pos/shared/ui-web';

export const adminNavSections: NavSection<AdminRouteId>[] = [
    {
        title: 'CORE',
        items: [
            { id: ADMIN_ROUTES.dashboard, title: 'Dashboard', icon: LayoutDashboard },
            {
                id: ADMIN_ROUTES.reports,
                title: 'Reports',
                icon: FileText,
                children: [
                    { id: ADMIN_ROUTES.endOfDay, title: 'End of Day', icon: Receipt },
                    { id: ADMIN_ROUTES.saleList, title: 'Sale List', icon: ShoppingCart },
                    { id: ADMIN_ROUTES.salesByEmployee, title: 'By Employee', icon: Users },
                    { id: ADMIN_ROUTES.salesByProduct, title: 'By Product', icon: Package },
                    { id: ADMIN_ROUTES.categoryPerformance, title: 'Category Performance', icon: Grid3x3 },
                    { id: ADMIN_ROUTES.paymentSummary, title: 'Payment Summary', icon: FileSpreadsheet },
                    { id: ADMIN_ROUTES.discountReport, title: 'Discount Report', icon: Percent },
                    { id: ADMIN_ROUTES.refundReport, title: 'Refund Report', icon: FileText },
                    { id: ADMIN_ROUTES.hourlySales, title: 'Hourly Sales', icon: FileSpreadsheet },
                    { id: ADMIN_ROUTES.ebtSummary, title: 'EBT Summary', icon: FileText },
                    { id: ADMIN_ROUTES.openOrdersAging, title: 'Open Orders Aging', icon: ClipboardList },
                ],
            },
        ],
    },
    {
        title: 'MANAGEMENT',
        items: [
            { id: ADMIN_ROUTES.employees, title: 'Employees', icon: Users },
            { id: ADMIN_ROUTES.discounts, title: 'Discounts', icon: Percent },
            {
                id: ADMIN_ROUTES.products,
                title: 'Catalog',
                icon: Grid3x3,
                children: [
                    { id: ADMIN_ROUTES.products, title: 'Products', icon: Package },
                    { id: ADMIN_ROUTES.categories, title: 'Categories', icon: Layers },
                    { id: ADMIN_ROUTES.units, title: 'U/M', icon: Ruler },
                    { id: ADMIN_ROUTES.brands, title: 'Brands', icon: Tag },
                ],
            },
            {
                id: ADMIN_ROUTES.inventoryStock,
                title: 'Inventory',
                icon: PackageOpen,
                children: [
                    { id: ADMIN_ROUTES.inventoryStock, title: 'In Stock', icon: PackageCheck },
                    { id: ADMIN_ROUTES.inventoryCounts, title: 'Counts', icon: ClipboardList },
                    { id: ADMIN_ROUTES.inventoryReceives, title: 'Receives', icon: Package },
                ],
            },
        ],
    },
    {
        title: 'CONFIGURATION',
        items: [
            {
                id: ADMIN_ROUTES.settings,
                title: 'Settings',
                icon: Settings,
                children: [
                    { id: ADMIN_ROUTES.store, title: 'Store', icon: Store },
                    { id: ADMIN_ROUTES.station, title: 'Station', icon: Monitor },
                    { id: ADMIN_ROUTES.printers, title: 'Printers', icon: Printer },
                    { id: ADMIN_ROUTES.logs, title: 'Logs', icon: FileSpreadsheet },
                ],
            },
        ],
    },
];
