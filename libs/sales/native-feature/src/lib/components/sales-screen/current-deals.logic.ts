import { CategoryEntity } from '@pos/categories/data-access';
import { DiscountDefinition } from '@pos/discounts/domain';
import { ProductEntity } from '@pos/products/data-access';
import { CartItem } from '@pos/sales/data-access';

import { isDefinitionActiveForContext } from '../cart/cart-discount.helpers';

export type SalesDiscountExplainerRow = {
    id: string;
    title: string;
    subtitle: string;
    isRelevantToSelectedProduct: boolean;
    group: 'relevant' | 'other';
    type: DiscountDefinition['type'];
};

type SortableSalesDiscountExplainerRow = SalesDiscountExplainerRow & {
    sortRank: number;
    sortName: string;
};

type EntityMap<T extends { id?: string | null }> = Record<string, T | undefined>;

interface BuildSalesDiscountExplainerRowsInput {
    definitions: DiscountDefinition[];
    now: string;
    timezone?: string | null;
    stationId?: string | null;
    selectedItem?: Pick<CartItem, 'product' | 'quantity'> | null;
    productsById?: EntityMap<ProductEntity>;
    categoriesById?: EntityMap<CategoryEntity>;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const formatCurrency = (value: number) => currencyFormatter.format(value || 0);

const formatPercent = (value: number) => {
    const normalized = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2);
    return `${normalized.replace(/\.00$/, '')}% off`;
};

const formatAmount = (value: number) => `${formatCurrency(value)} off`;

const toTitleCase = (value: string) =>
    value
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatTargetName = (
    ids: string[] | null | undefined,
    entitiesById: EntityMap<{ id?: string | null; name?: string | null }>,
    singularFallback: string,
    pluralFallback: string
) => {
    if (!ids?.length) {
        return pluralFallback;
    }

    if (ids.length === 1) {
        return entitiesById[ids[0]]?.name?.trim() || singularFallback;
    }

    return pluralFallback;
};

const getTargetKind = (definition: DiscountDefinition) => {
    if (definition.scope === 'ORDER') {
        return 'order';
    }

    if (definition.applicableProductIds?.length) {
        return 'product';
    }

    if (definition.applicableCategoryIds?.length) {
        return 'category';
    }

    return 'all-products';
};

const getBenefitText = (definition: DiscountDefinition) => {
    if (definition.method === 'PERCENT') {
        return formatPercent(definition.value);
    }

    if (definition.method === 'AMOUNT') {
        return formatAmount(definition.value);
    }

    return `Final price ${formatCurrency(definition.value)}`;
};

const getTargetText = (
    definition: DiscountDefinition,
    productsById: EntityMap<ProductEntity>,
    categoriesById: EntityMap<CategoryEntity>
) => {
    if (definition.scope === 'ORDER') {
        return 'your order';
    }

    if (definition.applicableProductIds?.length) {
        return formatTargetName(
            definition.applicableProductIds,
            productsById,
            'this product',
            'selected products'
        );
    }

    if (definition.applicableCategoryIds?.length) {
        const categoryName = formatTargetName(
            definition.applicableCategoryIds,
            categoriesById,
            'this category',
            'selected categories'
        );

        return `products in ${categoryName}`;
    }

    return 'eligible products';
};

const getTitle = (
    definition: DiscountDefinition,
    productsById: EntityMap<ProductEntity>,
    categoriesById: EntityMap<CategoryEntity>
) => {
    const benefitText = getBenefitText(definition);
    const targetText = getTargetText(definition, productsById, categoriesById);

    if (definition.type === 'PROMO_CODE') {
        const code = definition.code?.trim();
        if (code) {
            return `Use code ${code} for ${benefitText.toLowerCase()} ${targetText}`;
        }
    }

    if (definition.method === 'FINAL_PRICE') {
        return `${benefitText} for ${targetText}`;
    }

    return `${benefitText} ${targetText}`;
};

const getScheduleQualifier = (definition: DiscountDefinition) => {
    const qualifiers: string[] = [];

    if (definition.daysOfWeek?.length) {
        qualifiers.push(
            `on ${definition.daysOfWeek.map((day) => toTitleCase(day.slice(0, 3))).join(', ')}`
        );
    }

    if (definition.startTime && definition.endTime) {
        qualifiers.push(`between ${definition.startTime} and ${definition.endTime}`);
    } else if (definition.startTime) {
        qualifiers.push(`after ${definition.startTime}`);
    } else if (definition.endTime) {
        qualifiers.push(`until ${definition.endTime}`);
    }

    if (definition.startDate && definition.endDate) {
        qualifiers.push(`from ${definition.startDate} to ${definition.endDate}`);
    } else if (definition.startDate) {
        qualifiers.push(`starting ${definition.startDate}`);
    } else if (definition.endDate) {
        qualifiers.push(`through ${definition.endDate}`);
    }

    if (definition.stationIds?.length === 1) {
        qualifiers.push(`at station ${definition.stationIds[0]}`);
    } else if ((definition.stationIds?.length || 0) > 1) {
        qualifiers.push('at selected stations');
    }

    if (!qualifiers.length) {
        return undefined;
    }

    return `Available ${qualifiers.join(' ')}`;
};

const getThresholdQualifier = (definition: DiscountDefinition) => {
    const qualifiers: string[] = [];

    if (definition.minQuantity != null) {
        qualifiers.push(`when you buy ${definition.minQuantity} or more`);
    }

    if (definition.minSubtotal != null) {
        qualifiers.push(
            definition.scope === 'ORDER'
                ? `when the order reaches ${formatCurrency(definition.minSubtotal)}`
                : `when that line reaches ${formatCurrency(definition.minSubtotal)}`
        );
    }

    return qualifiers;
};

const getExclusionQualifier = (definition: DiscountDefinition) => {
    if (definition.excludeAlreadyDiscountedItems) {
        return 'Does not stack on already discounted items';
    }

    return undefined;
};

const getSubtitle = (definition: DiscountDefinition) => {
    const parts = [
        ...getThresholdQualifier(definition),
        getScheduleQualifier(definition),
        getExclusionQualifier(definition),
    ].filter(Boolean) as string[];

    if (!parts.length) {
        return 'Available now';
    }

    return parts.join(' • ');
};

const isRelevantToSelectedProduct = (
    definition: DiscountDefinition,
    selectedItem?: Pick<CartItem, 'product' | 'quantity'> | null
) => {
    if (!selectedItem || definition.scope !== 'LINE') {
        return false;
    }

    const productId = selectedItem.product.id;
    const categoryId = selectedItem.product.categoryId || '';

    if (definition.excludedProductIds?.includes(productId)) {
        return false;
    }

    if (definition.excludedCategoryIds?.includes(categoryId)) {
        return false;
    }

    if (definition.applicableProductIds?.length) {
        return definition.applicableProductIds.includes(productId);
    }

    if (definition.applicableCategoryIds?.length) {
        return definition.applicableCategoryIds.includes(categoryId);
    }

    return true;
};

const getSortRank = (
    definition: DiscountDefinition,
    isRelevant: boolean
) => {
    const kind = getTargetKind(definition);

    if (isRelevant) {
        switch (kind) {
            case 'product':
                return 0;
            case 'category':
                return 1;
            case 'all-products':
                return 2;
            default:
                return 3;
        }
    }

    switch (kind) {
        case 'product':
            return 4;
        case 'category':
            return 5;
        case 'all-products':
            return 6;
        default:
            return 7;
    }
};

export const buildSalesDiscountExplainerRows = ({
    definitions,
    now,
    timezone,
    stationId,
    selectedItem,
    productsById = {},
    categoriesById = {},
}: BuildSalesDiscountExplainerRowsInput): SalesDiscountExplainerRow[] =>
    definitions
        .filter(
            (definition) =>
                (definition.type === 'AUTOMATIC' || definition.type === 'PROMO_CODE') &&
                isDefinitionActiveForContext(definition, now, timezone, stationId)
        )
        .map<SortableSalesDiscountExplainerRow>((definition) => {
            const relevant = isRelevantToSelectedProduct(definition, selectedItem);

            return {
                id: definition.id,
                title: getTitle(definition, productsById, categoriesById),
                subtitle: getSubtitle(definition),
                isRelevantToSelectedProduct: relevant,
                group: relevant ? 'relevant' : 'other',
                type: definition.type,
                sortRank: getSortRank(definition, relevant),
                sortName: definition.name.toLowerCase(),
            };
        })
        .sort((left, right) => {
            if (left.sortRank !== right.sortRank) {
                return left.sortRank - right.sortRank;
            }

            return left.sortName.localeCompare(right.sortName, undefined, {
                sensitivity: 'base',
            });
        })
        .map(({ sortRank: _sortRank, sortName: _sortName, ...row }) => row);
