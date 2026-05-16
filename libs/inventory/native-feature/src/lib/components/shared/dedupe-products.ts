import { ProductEntity } from '@pos/products/data-access';

const normalize = (value?: string | null) => (value || '').trim().toLowerCase();

const dedupeKey = (product: ProductEntity) => {
    const code = normalize(product.barcode) || normalize(product.sku) || normalize(product.plu);
    if (code) return `code:${code}`;

    return `name:${normalize(product.name)}|uom:${normalize(product.unitOfMeasure)}|desc:${normalize(product.description)}`;
};

export function dedupeProducts(items: ProductEntity[]): ProductEntity[] {
    const map = new Map<string, ProductEntity>();

    items.forEach((item) => {
        const key = dedupeKey(item);
        const existing = map.get(key);

        if (!existing) {
            map.set(key, item);
            return;
        }

        const existingUpdated = new Date(existing.updatedAt || 0).getTime();
        const currentUpdated = new Date(item.updatedAt || 0).getTime();

        if (currentUpdated >= existingUpdated) {
            map.set(key, item);
        }
    });

    return [...map.values()];
}

