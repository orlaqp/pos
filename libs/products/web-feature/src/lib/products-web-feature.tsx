'use client';

import { useMemo, useState } from 'react';
import { ProductCatalogChange } from '@pos/admin/data-access';
import type { ProductEntity } from '@pos/products/data-access/entities';
import { Badge, Button, DataTable, PageHeader } from '@pos/shared/ui-web';
import { ProductEditView } from './product-edit-view';

type ProductsWebFeatureProps = {
    brands: Array<{ id?: string; name: string }>;
    categories: Array<{ id?: string; name: string }>;
    query: string;
    rows: ProductEntity[];
    units: Array<{ name: string }>;
    onApplyChange: (change: ProductCatalogChange) => void;
};

export function ProductsWebFeature({
    brands,
    categories,
    query,
    rows,
    units,
    onApplyChange,
}: ProductsWebFeatureProps) {
    const [editingProductId, setEditingProductId] = useState<string>();
    const filteredRows = useMemo(
        () =>
            rows.filter((row) =>
                [row.name, row.sku, row.barcode]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase()
                    .includes(query.toLowerCase())
            ),
        [query, rows]
    );
    const editingProduct = rows.find((row) => row.id === editingProductId);

    if (editingProduct) {
        return (
            <ProductEditView
                brands={brands}
                categories={categories}
                product={editingProduct}
                units={units}
                onApply={(change) => {
                    onApplyChange(change);
                    setEditingProductId(undefined);
                }}
                onCancel={() => setEditingProductId(undefined)}
            />
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Products"
                description="Catalog products recreated from the mobile product list and form model."
            />
            <DataTable
                title="Product Catalog"
                description="Review price, stock, identifiers, and active state."
                emptyLabel="No products found."
                rows={filteredRows}
                getRowKey={(row) => row.id}
                columns={[
                    { key: 'name', header: 'Product', render: (row) => row.name },
                    { key: 'sku', header: 'SKU', render: (row) => row.sku || 'Not set' },
                    { key: 'price', header: 'Price', render: (row) => `$${row.price.toFixed(2)}` },
                    { key: 'stock', header: 'Stock', render: (row) => `${row.quantity} ${row.unitOfMeasure}` },
                    {
                        key: 'status',
                        header: 'Status',
                        render: (row) => (
                            <Badge variant={row.isActive ? 'secondary' : 'outline'}>
                                {row.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        ),
                    },
                    {
                        key: 'actions',
                        header: '',
                        render: (row) => (
                            <Button variant="outline" size="sm" onClick={() => setEditingProductId(row.id)}>
                                Review edit
                            </Button>
                        ),
                    },
                ]}
            />
        </div>
    );
}
