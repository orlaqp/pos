import { ADMIN_ROUTES, AdminRouteId } from '@pos/admin/data-access';
import type { ProductEntity } from '../../../../products/data-access/src/lib/product.entity';
import { Badge, DataTable, EmptyState, PageHeader } from '@pos/shared/ui-web';

type InventoryWebFeatureProps = {
    products: ProductEntity[];
    query: string;
    route: AdminRouteId;
};

export function InventoryWebFeature({ products, query, route }: InventoryWebFeatureProps) {
    if (route !== ADMIN_ROUTES.inventoryStock) {
        return (
            <EmptyState
                title={route === ADMIN_ROUTES.inventoryCounts ? 'Inventory Counts' : 'Inventory Receives'}
                description="This screen is reserved for the matching mobile inventory workflow."
            />
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <PageHeader title="In Stock" description="Stock view based on the mobile inventory list." />
            <DataTable
                title="Inventory"
                description="Products with tracked stock and reorder status."
                emptyLabel="No stock-tracked products found."
                rows={products.filter((product) =>
                    product.trackStock &&
                    [product.name, product.sku, product.barcode]
                        .filter(Boolean)
                        .join(' ')
                        .toLowerCase()
                        .includes(query.toLowerCase())
                )}
                getRowKey={(row) => row.id}
                columns={[
                    { key: 'name', header: 'Product', render: (row) => row.name },
                    { key: 'stock', header: 'On Hand', render: (row) => `${row.quantity} ${row.unitOfMeasure}` },
                    { key: 'reorder', header: 'Reorder Point', render: (row) => row.reorderPoint ?? 'Not set' },
                    {
                        key: 'state',
                        header: 'State',
                        render: (row) => {
                            const isLow = Number(row.reorderPoint || 0) >= row.quantity;
                            return <Badge variant={isLow ? 'destructive' : 'secondary'}>{isLow ? 'Low' : 'Healthy'}</Badge>;
                        },
                    },
                ]}
            />
        </div>
    );
}
