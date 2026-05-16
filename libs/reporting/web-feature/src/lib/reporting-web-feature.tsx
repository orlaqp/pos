import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react';
import { AdminDashboardData, AdminRouteId, ADMIN_ROUTES } from '@pos/admin/data-access';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    DataTable,
    EmptyState,
    PageHeader,
} from '@pos/shared/ui-web';

type ReportingWebFeatureProps = {
    dashboard: AdminDashboardData;
    query: string;
    route: AdminRouteId;
    tenantName: string;
};

const METRIC_ICONS = [DollarSign, ShoppingCart, Users, Package];

const REPORT_TITLES: Partial<Record<AdminRouteId, string>> = {
    [ADMIN_ROUTES.dashboard]: 'Dashboard',
    [ADMIN_ROUTES.endOfDay]: 'End of Day',
    [ADMIN_ROUTES.salesByEmployee]: 'Sales by Employee',
    [ADMIN_ROUTES.salesByProduct]: 'Sales by Product',
    [ADMIN_ROUTES.categoryPerformance]: 'Category Performance',
    [ADMIN_ROUTES.paymentSummary]: 'Payment Summary',
    [ADMIN_ROUTES.discountReport]: 'Discount Report',
    [ADMIN_ROUTES.refundReport]: 'Refund Report',
    [ADMIN_ROUTES.hourlySales]: 'Hourly Sales',
    [ADMIN_ROUTES.ebtSummary]: 'EBT Summary',
    [ADMIN_ROUTES.openOrdersAging]: 'Open Orders Aging',
    [ADMIN_ROUTES.lowSalesItems]: 'Low Sales Items',
};

export function ReportingWebFeature({ dashboard, query, route, tenantName }: ReportingWebFeatureProps) {
    const filteredSales = dashboard.recentSales.filter((sale) =>
        [sale.orderNo, sale.amount, sale.timeAgo]
            .join(' ')
            .toLowerCase()
            .includes(query.toLowerCase())
    );

    if (route !== ADMIN_ROUTES.dashboard) {
        return <ReportDetail title={REPORT_TITLES[route] || 'Report'} sales={filteredSales} />;
    }

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Dashboard"
                description={`Welcome back. Here is what is happening at ${tenantName}.`}
            />
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {dashboard.metrics.map((metric, index) => {
                    const Icon = METRIC_ICONS[index] || DollarSign;
                    return (
                        <Card key={metric.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                                <Icon className="text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metric.value}</div>
                                <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </section>
            <section className="grid gap-4 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                        <CardDescription>Sales performance over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-72 items-end gap-3">
                            {dashboard.salesTrend.map((point) => (
                                <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
                                    <div className="w-full rounded-t-md bg-primary" style={{ height: `${Math.max(18, point.amount / 35)}px` }} />
                                    <span className="text-xs text-muted-foreground">{point.label}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <div className="lg:col-span-3">
                    <DataTable
                        title="Recent Sales"
                        description={`Latest completed orders for ${tenantName}`}
                        emptyLabel="No recent sales."
                        rows={filteredSales}
                        getRowKey={(row) => row.id}
                        columns={[
                            { key: 'order', header: 'Order', render: (row) => `#${row.orderNo}` },
                            { key: 'time', header: 'Time', render: (row) => row.timeAgo },
                            { key: 'amount', header: 'Amount', render: (row) => row.amount },
                        ]}
                    />
                </div>
            </section>
        </div>
    );
}

function ReportDetail({ title, sales }: { title: string; sales: AdminDashboardData['recentSales'] }) {
    if (!sales.length) {
        return <EmptyState title={title} description="No rows match the current search." />;
    }

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title={title}
                description="Functional report table backed by the selected tenant data."
            />
            <DataTable
                title={title}
                emptyLabel="No report rows found."
                rows={sales}
                getRowKey={(row) => row.id}
                columns={[
                    { key: 'order', header: 'Order', render: (row) => `#${row.orderNo}` },
                    { key: 'amount', header: 'Amount', render: (row) => row.amount },
                    { key: 'time', header: 'Time', render: (row) => row.timeAgo },
                ]}
            />
        </div>
    );
}
