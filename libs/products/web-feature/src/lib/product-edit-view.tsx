'use client';

import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProductCatalogChange, buildProductChangePreview } from '@pos/admin/data-access';
import type { ProductEntity } from '@pos/products/data-access/entities';
import { Button, PageHeader } from '@pos/shared/ui-web';
import {
    buildChange,
    buildInitialState,
    ProductFormUpdate,
    toEntityOptions,
    toUnitOptions,
} from './product-edit-model';
import {
    ProductCatalogSection,
    ProductChangePreview,
    ProductDetailsSection,
    ProductIdentifiersSection,
    ProductInventorySection,
    ProductProfile,
} from './product-edit-sections';

type ProductEditViewProps = {
    brands: Array<{ id?: string; name: string }>;
    categories: Array<{ id?: string; name: string }>;
    product: ProductEntity;
    units: Array<{ name: string }>;
    onApply: (change: ProductCatalogChange) => void;
    onCancel: () => void;
};

export function ProductEditView({
    brands,
    categories,
    product,
    units,
    onApply,
    onCancel,
}: ProductEditViewProps) {
    const [state, setState] = useState(() => buildInitialState(product));
    const change = useMemo(() => buildChange(product, state), [product, state]);
    const preview = buildProductChangePreview(product, change);
    const update: ProductFormUpdate = (key, value) =>
        setState((current) => ({ ...current, [key]: value }));

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-3">
                    <Button variant="ghost" size="sm" className="w-fit" onClick={onCancel}>
                        <ArrowLeft data-icon="inline-start" />
                        Back to catalog
                    </Button>
                    <PageHeader
                        title={product.name}
                        description="Review product catalog changes before applying them."
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button onClick={() => onApply(change)} disabled={!preview.fields.length || !change.name}>
                        Apply reviewed change
                    </Button>
                </div>
            </div>
            <ProductProfile product={product} state={state} />
            <ProductCatalogSection
                brandOptions={toEntityOptions(brands)}
                categoryOptions={toEntityOptions(categories)}
                state={state}
                unitOptions={toUnitOptions(units)}
                update={update}
            />
            <ProductDetailsSection state={state} update={update} />
            <ProductIdentifiersSection state={state} update={update} />
            <ProductInventorySection state={state} update={update} />
            <ProductChangePreview preview={preview} />
        </div>
    );
}
