import type { RecentSale } from '@pos/admin/data-access';
import { DataTable, PageHeader } from '@pos/shared/ui-web';

export function SalesWebFeature({ query, sales }: { query: string; sales: RecentSale[] }) {
    const filteredSales = sales.filter((sale) =>
        [sale.orderNo, sale.amount, sale.timeAgo]
            .join(' ')
            .toLowerCase()
            .includes(query.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Sale List"
                description="Order drilldown surface prepared for reused order and sales data access."
            />
            <DataTable
                title="Recent Sales"
                description="Latest sales for the selected tenant."
                emptyLabel="No sales found."
                rows={filteredSales}
                getRowKey={(row) => row.id}
                columns={[
                    { key: 'order', header: 'Order', render: (row) => `#${row.orderNo}` },
                    { key: 'time', header: 'Time', render: (row) => row.timeAgo },
                    { key: 'amount', header: 'Amount', render: (row) => row.amount },
                ]}
            />
        </div>
    );
}
