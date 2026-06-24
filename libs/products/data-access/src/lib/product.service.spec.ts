/* eslint-disable import/first */
jest.mock('react-native', () => ({
    Alert: { alert: jest.fn() },
}));

jest.mock('@pos/shared/amplify', () => ({
    DataStore: {
        save: jest.fn(async (value) => value),
        query: jest.fn(),
    },
}));

jest.mock('@pos/shared/models', () => {
    const actual = jest.requireActual('@pos/shared/models');

    class MockProduct {
        constructor(init: Record<string, unknown>) {
            Object.assign(this, init);
        }

        static copyOf(
            existing: Record<string, unknown>,
            mutator: (draft: Record<string, unknown>) => void
        ) {
            const draft = { ...existing };
            mutator(draft);
            return draft;
        }
    }

    return {
        ...actual,
        Product: MockProduct,
    };
});

import { ProductService } from './product.service';
import { DataStore } from '@pos/shared/amplify';

describe('ProductService.search barcode handling', () => {
    const products = [
        {
            id: 'p1',
            name: 'Apple Fixture',
            description: 'fixture',
            barcode: '123456789012',
            sku: 'FIX-APPLE',
            plu: '1111',
            price: 2.49,
            quantity: 100,
            unitOfMeasure: 'EA',
            isActive: true,
        },
        {
            id: 'p2',
            name: 'Bulk Bananas',
            description: 'weighed produce',
            barcode: null,
            sku: 'BAN-WEIGH',
            plu: '4015',
            price: 1.99,
            quantity: 50,
            unitOfMeasure: 'LB',
            isActive: true,
        },
        {
            id: 'p3',
            name: 'Weighted Test Item',
            description: 'weighted regression item',
            barcode: null,
            sku: 'WEIGHT-6165',
            plu: '6165',
            price: 2.99,
            quantity: 25,
            unitOfMeasure: 'LB',
            isActive: true,
        },
        {
            id: 'p4',
            name: 'Weighted EAN13 Item',
            description: 'weighted ean13 regression item',
            barcode: null,
            sku: 'WEIGHT-6245',
            plu: '6245',
            price: 4.25,
            quantity: 30,
            unitOfMeasure: 'LB',
            isActive: true,
        },
    ] as any;

    it('matches numeric barcode with trailing scanner newline', () => {
        const res = ProductService.search(products, {
            text: '123456789012\n',
            onlyActive: true,
        });

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p1');
        expect(res.allNumbers).toBe(true);
    });

    it('matches numeric barcode when scanner sends prefixed mixed text', () => {
        const res = ProductService.search(products, {
            text: ']C1123456789012',
            onlyActive: true,
        });

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p1');
        expect(res.allNumbers).toBe(true);
    });

    it('matches numeric barcode when scanner sends long prefix/suffix noise', () => {
        const res = ProductService.search(products, {
            text: 'SCAN:A1-XYZ-123456789012-END',
            onlyActive: true,
        });

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p1');
        expect(res.allNumbers).toBe(true);
    });

    it('matches a weighted barcode by plu and derives quantity', () => {
        const res = ProductService.search(products, {
            text: '204015001990',
            onlyActive: true,
        });

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p2');
        expect(res.allNumbers).toBe(true);
        expect(res.price).toBe(199);
        expect(res.quantity).toBeCloseTo(1, 5);
    });

    it('defaults to legacy weighted barcode parsing when no scale profile is provided', () => {
        const res = ProductService.search(products, {
            text: '204015001990',
            onlyActive: true,
        });

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p2');
        expect(res.price).toBe(199);
        expect(res.quantity).toBeCloseTo(1, 5);
    });

    it('parses migrated EAN-13 scale labels with four digit PLU and five digit price', () => {
        const res = ProductService.search(products, {
            text: '0262452129987',
            onlyActive: true,
            scaleBarcodePriceFormat: 'EAN13_02_4_PLU_5_PRICE',
        });

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p4');
        expect(res.price).toBe(12998);
        expect(res.quantity).toBeCloseTo(12998 / 100 / 4.25, 5);
    });

    it('falls back to legacy weighted labels for migrated tenants when new profile does not resolve', () => {
        const res = ProductService.search(products, {
            text: '204015001990',
            onlyActive: true,
            scaleBarcodePriceFormat: 'EAN13_02_4_PLU_5_PRICE',
        });

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p2');
        expect(res.price).toBe(199);
    });

    it('prioritizes exact full barcode over weighted label parsing', () => {
        const res = ProductService.search(
            [
                ...products,
                {
                    id: 'full-barcode',
                    name: 'Full Barcode Product',
                    description: 'normal barcode',
                    barcode: '0262452129987',
                    sku: null,
                    plu: null,
                    price: 9.99,
                    quantity: 10,
                    unitOfMeasure: 'EA',
                    isActive: true,
                },
            ] as any,
            {
                text: '0262452129987',
                onlyActive: true,
                scaleBarcodePriceFormat: 'EAN13_02_4_PLU_5_PRICE',
            },
        );

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('full-barcode');
        expect(res.price).toBeUndefined();
        expect(res.quantity).toBeUndefined();
    });

    it('prefers migrated profile when migrated and legacy candidates resolve different products', () => {
        const res = ProductService.search(
            [
                ...products,
                {
                    id: 'legacy-conflict',
                    name: 'Legacy Conflict',
                    description: 'legacy candidate',
                    barcode: null,
                    sku: null,
                    plu: '624',
                    price: 1,
                    quantity: 10,
                    unitOfMeasure: 'LB',
                    isActive: true,
                },
            ] as any,
            {
                text: '0262452129987',
                onlyActive: true,
                scaleBarcodePriceFormat: 'EAN13_02_4_PLU_5_PRICE',
            },
        );

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p4');
        expect(res.price).toBe(12998);
    });

    it('matches a weighted barcode when scanner sends prefixed mixed text', () => {
        const res = ProductService.search(products, {
            text: ']C1204015001990',
            onlyActive: true,
        });

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p2');
        expect(res.allNumbers).toBe(true);
        expect(res.price).toBe(199);
        expect(res.quantity).toBeCloseTo(1, 5);
    });

    it('matches the weighed barcode regression sample 206165226181', () => {
        const res = ProductService.search(products, {
            text: '206165226181',
            onlyActive: true,
        });

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p3');
        expect(res.items[0].plu).toBe('6165');
        expect(res.allNumbers).toBe(true);
        expect(res.price).toBe(2618);
        expect(res.quantity).toBeCloseTo(2618 / 100 / 2.99, 5);
    });

    it('matches the migrated weighed barcode regression sample 0262452129987', () => {
        const res = ProductService.search(products, {
            text: '0262452129987',
            onlyActive: true,
            scaleBarcodePriceFormat: 'EAN13_02_4_PLU_5_PRICE',
        });

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p4');
        expect(res.items[0].plu).toBe('6245');
        expect(res.allNumbers).toBe(true);
        expect(res.price).toBe(12998);
        expect(res.quantity).toBeCloseTo(12998 / 100 / 4.25, 5);
    });

    it('matches a product by direct plu search', () => {
        const res = ProductService.search(products, {
            text: '6165',
            onlyActive: true,
        });

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p3');
        expect(res.allNumbers).toBe(true);
    });

    it('matches a product by partial plu text search', () => {
        const res = ProductService.search(products, {
            text: '616',
            onlyActive: true,
        });

        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('p3');
        expect(res.allNumbers).toBe(false);
    });
});

describe('ProductService.save inventory ownership', () => {
    const dispatch = jest.fn();
    const mockedSave = jest.mocked(DataStore.save);
    const mockedQuery = jest.mocked(DataStore.query);

    beforeEach(() => {
        jest.clearAllMocks();
        mockedQuery.mockResolvedValue([]);
    });

    it('creates new products with quantity forced to zero', async () => {
        mockedSave.mockImplementation(async (value) => ({
            ...value,
            id: value.id || 'product-1',
        }));

        await ProductService.save(
            dispatch,
            {
                id: undefined as unknown as string,
                name: 'Apple',
                description: 'Fresh',
                price: 5,
                tags: null,
                cost: 2,
                barcode: '111',
                sku: 'APL-1',
                plu: '4015',
                quantity: 99,
                unitOfMeasure: 'EA',
                trackStock: true,
                reorderPoint: 10,
                reorderQuantity: 20,
                picture: null,
                productCategoryId: null,
                productBrandId: null,
                discountable: true,
                minAllowedPrice: null,
                maxManualDiscountPercent: null,
                maxManualDiscountAmount: null,
                isActive: true,
                isEBTEligible: false,
            } as any
        );

        expect(mockedSave).toHaveBeenCalledWith(
            expect.objectContaining({
                quantity: 0,
            })
        );
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'products/add',
                payload: expect.objectContaining({
                    quantity: 0,
                }),
            })
        );
    });

    it('updates catalog fields without overwriting local quantity state', async () => {
        mockedQuery
            .mockResolvedValueOnce({
                id: 'product-1',
                quantity: 14,
                name: 'Apple',
                barcode: '111',
                sku: 'APL-1',
                plu: '4015',
            } as any)
            .mockResolvedValueOnce([]);

        await ProductService.save(
            dispatch,
            {
                id: 'product-1',
                name: 'Apple',
                description: 'Fresh',
                price: 6,
                tags: null,
                cost: 3,
                barcode: '111',
                sku: 'APL-1',
                plu: '4015',
                quantity: 999,
                unitOfMeasure: 'EA',
                trackStock: true,
                reorderPoint: 10,
                reorderQuantity: 20,
                picture: null,
                productCategoryId: null,
                productBrandId: null,
                discountable: true,
                minAllowedPrice: null,
                maxManualDiscountPercent: null,
                maxManualDiscountAmount: null,
                isActive: true,
                isEBTEligible: false,
            } as any
        );

        expect(mockedSave).toHaveBeenCalledWith(
            expect.objectContaining({
                price: 6,
            })
        );
        expect((mockedSave.mock.calls[0]?.[0] as any).quantity).not.toBe(999);
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'products/update',
                payload: expect.objectContaining({
                    id: 'product-1',
                    changes: expect.not.objectContaining({
                        quantity: expect.anything(),
                    }),
                }),
            })
        );
    });
});
