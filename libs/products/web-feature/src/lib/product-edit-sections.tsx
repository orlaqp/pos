'use client';

import { buildProductChangePreview } from '@pos/admin/data-access';
import type { ProductEntity } from '@pos/products/data-access/entities';
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
} from '@pos/shared/ui-web';
import type { CatalogOption, ProductFormState, ProductFormUpdate } from './product-edit-model';

const CLEAR_SELECTION_VALUE = '__clear__';

export function ProductProfile({ product, state }: { product: ProductEntity; state: ProductFormState }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                        <CardTitle>Product Profile</CardTitle>
                        <CardDescription>Configure catalog details, pricing, and identifiers.</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant={state.isActive ? 'secondary' : 'outline'}>{state.isActive ? 'Available' : 'Hidden'}</Badge>
                        <Badge variant={state.isEBTEligible ? 'secondary' : 'outline'}>{state.isEBTEligible ? 'EBT Eligible' : 'Regular Product'}</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
                {product.description || 'No description has been set.'}
            </CardContent>
        </Card>
    );
}

export function ProductCatalogSection({
    brandOptions,
    categoryOptions,
    state,
    unitOptions,
    update,
}: {
    brandOptions: CatalogOption[];
    categoryOptions: CatalogOption[];
    state: ProductFormState;
    unitOptions: CatalogOption[];
    update: ProductFormUpdate;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Catalog</CardTitle>
                <CardDescription>Classification and sale eligibility.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
                <ProductSelect clearable label="Brand" options={brandOptions} placeholder="Select Brand" value={state.productBrandId} onChange={(value) => update('productBrandId', value)} />
                <ProductSelect clearable label="Category" options={categoryOptions} placeholder="Select Category" value={state.productCategoryId} onChange={(value) => update('productCategoryId', value)} />
                <ProductSelect label="Unit of measure" options={unitOptions} placeholder="Select U/of Measure" value={state.unitOfMeasure} onChange={(value) => update('unitOfMeasure', value)} />
                <div className="flex flex-wrap items-end gap-2">
                    <Button variant={state.isActive ? 'secondary' : 'outline'} onClick={() => update('isActive', !state.isActive)}>
                        {state.isActive ? 'Available for sale' : 'Hidden from sale'}
                    </Button>
                    <Button variant={state.isEBTEligible ? 'secondary' : 'outline'} onClick={() => update('isEBTEligible', !state.isEBTEligible)}>
                        {state.isEBTEligible ? 'EBT eligible' : 'Regular product'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export function ProductDetailsSection({ state, update }: { state: ProductFormState; update: ProductFormUpdate }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Details</CardTitle>
                <CardDescription>Name, description, cost, and price.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <ProductInput label="Product name" value={state.name} onChange={(value) => update('name', value)} />
                <ProductTextarea label="Description" value={state.description} onChange={(value) => update('description', value)} />
                <div className="grid gap-4 md:grid-cols-2">
                    <ProductInput label="Cost" type="number" value={state.cost} onChange={(value) => update('cost', value)} />
                    <ProductInput label="Price" type="number" value={state.price} onChange={(value) => update('price', value)} />
                </div>
            </CardContent>
        </Card>
    );
}

export function ProductIdentifiersSection({ state, update }: { state: ProductFormState; update: ProductFormUpdate }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Identifiers</CardTitle>
                <CardDescription>Barcode, SKU, and PLU values.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
                <ProductInput label="Barcode / UPC" value={state.barcode} onChange={(value) => update('barcode', value)} />
                <ProductInput label="SKU" value={state.sku} onChange={(value) => update('sku', value)} />
                <ProductInput label="PLU" value={state.plu} onChange={(value) => update('plu', value)} />
            </CardContent>
        </Card>
    );
}

export function ProductInventorySection({ state, update }: { state: ProductFormState; update: ProductFormUpdate }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Inventory</CardTitle>
                <CardDescription>Stock tracking and reorder defaults.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
                <ProductInput label="Current stock" type="number" value={state.quantity} onChange={(value) => update('quantity', value)} />
                <ProductInput label="Reorder point" type="number" value={state.reorderPoint} onChange={(value) => update('reorderPoint', value)} />
                <ProductInput label="Reorder quantity" type="number" value={state.reorderQuantity} onChange={(value) => update('reorderQuantity', value)} />
                <Button variant={state.trackStock ? 'secondary' : 'outline'} onClick={() => update('trackStock', !state.trackStock)}>
                    {state.trackStock ? 'Tracking stock' : 'Stock not tracked'}
                </Button>
            </CardContent>
        </Card>
    );
}

export function ProductChangePreview({ preview }: { preview: ReturnType<typeof buildProductChangePreview> }) {
    return (
        <div className="flex flex-wrap gap-2">
            {preview.fields.length ? preview.fields.map((field) => (
                <Badge key={field.label} variant="outline">
                    {field.label}: {field.before} to {field.after}
                </Badge>
            )) : <Badge variant="secondary">No changes yet</Badge>}
        </div>
    );
}

function ProductSelect({ clearable, label, options, placeholder, value, onChange }: { clearable?: boolean; label: string; options: CatalogOption[]; placeholder: string; value: string; onChange: (value: string) => void }) {
    return (
        <label className="flex flex-col gap-2 text-sm font-medium">
            {label}
            <Select value={value || (clearable ? CLEAR_SELECTION_VALUE : '')} onValueChange={(nextValue) => onChange(nextValue === CLEAR_SELECTION_VALUE ? '' : nextValue)}>
                <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
                <SelectContent>
                    {clearable ? <SelectItem checked={!value} value={CLEAR_SELECTION_VALUE}>None</SelectItem> : null}
                    {options.map((option) => <SelectItem checked={option.id === value} key={option.id} value={option.id}>{option.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </label>
    );
}

function ProductInput({ label, value, onChange, type = 'text' }: { label: string; value: string; type?: string; onChange: (value: string) => void }) {
    return (
        <label className="flex flex-col gap-2 text-sm font-medium">
            {label}
            <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
        </label>
    );
}

function ProductTextarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
    return (
        <label className="flex flex-col gap-2 text-sm font-medium">
            {label}
            <Textarea value={value} onChange={(event) => onChange(event.target.value)} />
        </label>
    );
}
