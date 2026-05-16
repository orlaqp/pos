import { buildSalesDiscountExplainerRows } from './current-deals.logic';

const baseDefinition = {
    id: 'discount-1',
    name: 'Egg Special',
    status: 'ACTIVE' as const,
    stackMode: 'STACKABLE' as const,
    value: 30,
    approvalRequired: false,
    reasonRequired: false,
};

const productMap = {
    huevo: {
        id: 'huevo',
        name: 'Huevo',
    },
    pollo: {
        id: 'pollo',
        name: 'Chicken Breast',
    },
} as any;

const categoryMap = {
    protein: {
        id: 'protein',
        name: 'POLLO',
    },
} as any;

describe('buildSalesDiscountExplainerRows', () => {
    const now = '2026-04-19T14:00:00.000Z';

    it('renders human-readable copy for a selected product automatic discount', () => {
        const rows = buildSalesDiscountExplainerRows({
            definitions: [
                {
                    ...baseDefinition,
                    type: 'AUTOMATIC',
                    scope: 'LINE',
                    method: 'PERCENT',
                    applicableProductIds: ['huevo'],
                    minQuantity: 3,
                },
            ],
            now,
            timezone: 'America/New_York',
            stationId: '51',
            selectedItem: {
                product: {
                    id: 'huevo',
                    name: 'Huevo',
                    price: 4.99,
                    categoryId: 'protein',
                    unitOfMeasure: 'ea',
                },
                quantity: 1,
            },
            productsById: productMap,
            categoriesById: categoryMap,
        });

        expect(rows).toEqual([
            expect.objectContaining({
                title: '30% off Huevo',
                subtitle: 'when you buy 3 or more',
                isRelevantToSelectedProduct: true,
                group: 'relevant',
            }),
        ]);
    });

    it('renders category-targeted discounts in plain language', () => {
        const rows = buildSalesDiscountExplainerRows({
            definitions: [
                {
                    ...baseDefinition,
                    id: 'discount-2',
                    type: 'AUTOMATIC',
                    scope: 'LINE',
                    method: 'AMOUNT',
                    value: 5,
                    applicableCategoryIds: ['protein'],
                    minSubtotal: 12,
                },
            ],
            now,
            timezone: 'America/New_York',
            stationId: '51',
            productsById: productMap,
            categoriesById: categoryMap,
        });

        expect(rows[0]).toEqual(
            expect.objectContaining({
                title: '$5.00 off products in POLLO',
                subtitle: 'when that line reaches $12.00',
                group: 'other',
            })
        );
    });

    it('renders promo code order discounts in plain language', () => {
        const rows = buildSalesDiscountExplainerRows({
            definitions: [
                {
                    ...baseDefinition,
                    id: 'discount-3',
                    type: 'PROMO_CODE',
                    code: 'SAVE10',
                    scope: 'ORDER',
                    method: 'PERCENT',
                    minSubtotal: 50,
                },
            ],
            now,
            timezone: 'America/New_York',
            stationId: '51',
        });

        expect(rows[0]).toEqual(
            expect.objectContaining({
                title: 'Use code SAVE10 for 30% off your order',
                subtitle: 'when the order reaches $50.00',
            })
        );
    });

    it('filters out manual, inactive, and wrong-station discounts', () => {
        const rows = buildSalesDiscountExplainerRows({
            definitions: [
                {
                    ...baseDefinition,
                    id: 'manual',
                    type: 'MANUAL',
                    scope: 'LINE',
                    method: 'PERCENT',
                },
                {
                    ...baseDefinition,
                    id: 'inactive',
                    status: 'INACTIVE',
                    type: 'AUTOMATIC',
                    scope: 'LINE',
                    method: 'PERCENT',
                },
                {
                    ...baseDefinition,
                    id: 'wrong-station',
                    type: 'AUTOMATIC',
                    scope: 'LINE',
                    method: 'PERCENT',
                    stationIds: ['99'],
                },
                {
                    ...baseDefinition,
                    id: 'valid',
                    type: 'AUTOMATIC',
                    scope: 'LINE',
                    method: 'PERCENT',
                },
            ],
            now,
            timezone: 'America/New_York',
            stationId: '51',
        });

        expect(rows).toHaveLength(1);
        expect(rows[0].id).toBe('valid');
    });

    it('pins selected-product-relevant discounts before other current deals', () => {
        const rows = buildSalesDiscountExplainerRows({
            definitions: [
                {
                    ...baseDefinition,
                    id: 'order-wide',
                    name: 'Order Wide',
                    type: 'AUTOMATIC',
                    scope: 'ORDER',
                    method: 'AMOUNT',
                    value: 5,
                },
                {
                    ...baseDefinition,
                    id: 'product-match',
                    name: 'Product Match',
                    type: 'AUTOMATIC',
                    scope: 'LINE',
                    method: 'PERCENT',
                    applicableProductIds: ['huevo'],
                },
                {
                    ...baseDefinition,
                    id: 'category-other',
                    name: 'Category Other',
                    type: 'AUTOMATIC',
                    scope: 'LINE',
                    method: 'PERCENT',
                    applicableCategoryIds: ['protein'],
                },
            ],
            now,
            timezone: 'America/New_York',
            stationId: '51',
            selectedItem: {
                product: {
                    id: 'huevo',
                    name: 'Huevo',
                    price: 4.99,
                    categoryId: 'protein',
                    unitOfMeasure: 'ea',
                },
                quantity: 1,
            },
            productsById: productMap,
            categoriesById: categoryMap,
        });

        expect(rows.map((row) => row.id)).toEqual([
            'product-match',
            'category-other',
            'order-wide',
        ]);
        expect(rows[0].group).toBe('relevant');
    });

    it('includes schedule qualifiers only when they exist', () => {
        const rows = buildSalesDiscountExplainerRows({
            definitions: [
                {
                    ...baseDefinition,
                    id: 'scheduled',
                    type: 'AUTOMATIC',
                    scope: 'LINE',
                    method: 'FINAL_PRICE',
                    value: 2,
                    startTime: '09:00',
                    endTime: '14:00',
                    daysOfWeek: ['MON', 'TUE'],
                },
            ],
            now: '2026-04-20T14:00:00.000Z',
            timezone: 'America/New_York',
            stationId: '51',
        });

        expect(rows[0].subtitle).toBe('Available on Mon, Tue between 09:00 and 14:00');
    });
});
