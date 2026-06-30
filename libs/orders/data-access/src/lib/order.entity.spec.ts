/* eslint-disable @typescript-eslint/no-var-requires */
jest.mock('react-native', () => ({
    Alert: { alert: jest.fn() },
}));

jest.mock('@pos/settings/data-access', () => ({
    StationService: {
        getNextOrderNumber: jest.fn(async () => '51-TEST-0003'),
    },
}));

jest.mock('@pos/employees/data-access', () => ({
    EmployeeService: {
        getById: jest.fn(),
    },
}));

jest.mock('react-native-uuid', () => ({
    v4: jest.fn(() => 'refund-cart-id'),
}));

const { OrderEntityMapper } = require('./order.entity');

describe('OrderEntityMapper', () => {
    it('strips EBT/NON-EBT prefixes from order line names', () => {
        const nonEbtLine = OrderEntityMapper.fromLine({
            identifier: 'line-1',
            productId: 'p-1',
            barcode: null,
            sku: null,
            productName: 'NON-EBT Shampoo Fixture',
            quantity: 1,
            price: 6.5,
            tax: 0,
            unitOfMeasure: 'EA',
        });

        const ebtLine = OrderEntityMapper.fromLine({
            identifier: 'line-2',
            productId: 'p-2',
            barcode: null,
            sku: null,
            productName: 'EBT Apple Fixture',
            quantity: 1,
            price: 2.49,
            tax: 0,
            unitOfMeasure: 'EA',
        });

        expect(nonEbtLine.productName).toBe('Shampoo Fixture');
        expect(ebtLine.productName).toBe('Apple Fixture');
    });

    it('sanitizes names when building cart state from order entity', () => {
        const cart = OrderEntityMapper.asCartState({
            id: 'o-1',
            orderNo: '51-TEST-0001',
            subtotal: 10,
            tax: 0,
            total: 10,
            status: 'OPEN',
            employeeId: 'e-1',
            employeeName: 'Tester',
            orderDate: '2026-03-12T00:00:00.000Z',
            appliedDiscountSummary: {
                applications: [
                    {
                        discountApplicationId: 'manual-order',
                        applicationType: 'MANUAL_ORDER_DISCOUNT',
                        scope: 'ORDER',
                        method: 'AMOUNT',
                        name: 'Manual order discount',
                        source: 'manual',
                        value: 1.25,
                        discountAmount: 1.25,
                        finalAmount: 8.75,
                    },
                ],
                orderLevelAdjustments: [
                    {
                        discountApplicationId: 'manual-order',
                        applicationType: 'MANUAL_ORDER_DISCOUNT',
                        scope: 'ORDER',
                        method: 'AMOUNT',
                        name: 'Manual order discount',
                        source: 'manual',
                        value: 1.25,
                        discountAmount: 1.25,
                        finalAmount: 8.75,
                    },
                ],
                lineSummaries: [
                    {
                        lineId: 'line-1',
                        discounts: [
                            {
                                discountApplicationId: 'override-line-1',
                                applicationType: 'PRICE_OVERRIDE',
                                scope: 'LINE',
                                method: 'FINAL_PRICE',
                                name: 'Price override',
                                source: 'override',
                                value: 8.75,
                                discountAmount: 1.25,
                                finalAmount: 8.75,
                            },
                        ],
                        lineDiscountTotal: 1.25,
                        allocatedOrderDiscountTotal: 0,
                        lineTotalBeforeTax: 8.75,
                    },
                ],
                approvalEvents: [],
                warnings: [],
            },
            lines: [
                {
                    identifier: 'line-1',
                    productId: 'p-1',
                    barcode: null,
                    sku: null,
                    productName: 'NON-EBT Soap Fixture',
                    quantity: 1,
                    tax: 0,
                    price: 10,
                    unitOfMeasure: 'EA',
                    isEBTEligible: false,
                },
            ],
            payments: null,
            paymentInfo: null,
            refundInfo: null,
        });

        expect(cart.items[0].product.name).toBe('Soap Fixture');
        expect(cart.manualDiscounts).toEqual([
            expect.objectContaining({
                kind: 'MANUAL_DISCOUNT',
                scope: 'ORDER',
                value: 1.25,
            }),
        ]);
        expect(cart.priceOverrides).toEqual([
            expect.objectContaining({
                kind: 'PRICE_OVERRIDE',
                lineId: 'line-1',
                finalPrice: 8.75,
            }),
        ]);
    });

    it('maps payment info payments from order model', () => {
        const orderEntity = OrderEntityMapper.fromModel({
            id: 'o-2',
            orderNo: '51-TEST-0002',
            subtotal: 40,
            tax: 0,
            total: 40,
            status: 'PAID',
            employeeId: 'e-1',
            employeeName: 'Tester',
            orderDate: '2026-03-12T00:00:00.000Z',
            createdAt: '2026-03-12T00:00:00.000Z',
            updatedAt: '2026-03-12T00:00:00.000Z',
            lines: [],
            paymentInfo: {
                employeeId: 'e-1',
                employeeName: 'Tester',
                payments: [{ type: 'EBT', amount: 24.9 }],
            },
            refundInfo: null,
        });

        expect(orderEntity.paymentInfo?.payments).toEqual([
            { type: 'EBT', amount: 24.9 },
        ]);
    });

    it('maps optional surcharge payment snapshot fields from order model', () => {
        const orderEntity = OrderEntityMapper.fromModel({
            id: 'o-2b',
            orderNo: '51-TEST-0002B',
            subtotal: 40,
            tax: 0,
            total: 40,
            status: 'PAID',
            employeeId: 'e-1',
            employeeName: 'Tester',
            orderDate: '2026-03-12T00:00:00.000Z',
            createdAt: '2026-03-12T00:00:00.000Z',
            updatedAt: '2026-03-12T00:00:00.000Z',
            lines: [],
            paymentInfo: {
                employeeId: 'e-1',
                employeeName: 'Tester',
                payments: [
                    {
                        type: 'CC',
                        amount: 10.8,
                        baseAmount: 10,
                        surchargeRate: 0.03,
                        surchargeAmount: 0.8,
                    },
                ],
            },
            refundInfo: null,
        } as any);

        expect(orderEntity.paymentInfo?.payments).toEqual([
            {
                type: 'CC',
                amount: 10.8,
                baseAmount: 10,
                surchargeRate: 0.03,
                surchargeAmount: 0.8,
            },
        ]);
    });

    it('preserves optional surcharge payment fields when restoring cart payments', () => {
        const cart = OrderEntityMapper.asCartState({
            id: 'o-restore-1',
            orderNo: '51-TEST-0004',
            baseSubtotal: 10,
            subtotal: 10,
            lineDiscountTotal: 0,
            orderDiscountTotal: 0,
            discountTotal: 0,
            savingsTotal: 0,
            tax: 0.8,
            total: 10.8,
            status: 'PAID',
            employeeId: 'e-1',
            employeeName: 'Tester',
            pricingSource: 'OFFLINE_LOCAL',
            reconciliationStatus: 'PENDING',
            orderDate: '2026-03-12T00:00:00.000Z',
            lines: [],
            payments: null,
            paymentInfo: {
                employeeId: 'e-1',
                employeeName: 'Tester',
                payments: [
                    {
                        type: 'CC',
                        amount: 10.8,
                        baseAmount: 10,
                        surchargeRate: 0.03,
                        surchargeAmount: 0.8,
                    },
                    {
                        type: 'CASH',
                        amount: 5,
                    },
                ],
            },
            refundInfo: null,
        });

        expect(cart.payments).toEqual([
            {
                type: 'CC',
                amount: 10.8,
                baseAmount: 10,
                surchargeRate: 0.03,
                surchargeAmount: 0.8,
            },
            {
                type: 'CASH',
                amount: 5,
                baseAmount: undefined,
                surchargeRate: undefined,
                surchargeAmount: undefined,
            },
        ]);
    });

    it('does not crash on malformed applied discount summary values', () => {
        const orderEntity = OrderEntityMapper.fromModel({
            id: 'o-3',
            orderNo: '51-TEST-0003',
            subtotal: 12,
            tax: 0,
            total: 12,
            status: 'PAID',
            employeeId: 'e-1',
            employeeName: 'Tester',
            orderDate: '2026-03-12T00:00:00.000Z',
            createdAt: '2026-03-12T00:00:00.000Z',
            updatedAt: '2026-03-12T00:00:00.000Z',
            appliedDiscountSummary: 'oops',
            lines: [],
            paymentInfo: null,
            refundInfo: null,
        });

        expect(orderEntity.appliedDiscountSummary).toBeNull();
    });

    it('does not crash on malformed applied discounts in order lines', () => {
        const line = OrderEntityMapper.fromLine({
            identifier: 'line-3',
            productId: 'p-3',
            barcode: null,
            sku: null,
            productName: 'Apple',
            quantity: 1,
            price: 2.49,
            tax: 0,
            unitOfMeasure: 'EA',
            appliedDiscounts: '{"broken":',
        });

        expect(line.appliedDiscounts).toEqual([]);
    });

    it('preserves line tax and taxable snapshots', () => {
        const line = OrderEntityMapper.fromLine({
            identifier: 'line-tax',
            productId: 'p-tax',
            barcode: null,
            sku: null,
            productName: 'Coffee',
            quantity: 2,
            price: 10,
            basePrice: 10,
            tax: 1.5,
            taxable: true,
            lineTotalBeforeTax: 15,
            lineTotalAfterTax: 16.5,
            unitOfMeasure: 'EA',
        });

        expect(line.tax).toBe(1.5);
        expect(line.taxable).toBe(true);
        expect(line.lineTotalAfterTax).toBe(16.5);
    });

    it('rebuilds refunded cart even when incoming cart header is missing', async () => {
        const refundedCart = await OrderEntityMapper.fromRefundedCart(
            {
                id: 'e-1',
                firstName: 'Test',
                lastName: 'Cashier',
            },
            {
                id: 'o-1',
                items: [
                    {
                        identifier: 'line-1',
                        quantity: 2,
                        product: {
                            id: 'p-1',
                            name: 'Apple',
                            price: 2.5,
                            unitOfMeasure: 'EA',
                            barcode: null,
                            sku: null,
                            isEBTEligible: true,
                            taxable: true,
                        },
                    },
                ],
                footer: {
                    discount: 0,
                    subtotal: 5,
                    tax: 0,
                    total: 5,
                },
                selected: undefined,
                header: undefined,
            }
        );

        expect(refundedCart.header).toBeDefined();
        expect(refundedCart.id).toBe('refund-cart-id');
        expect(refundedCart.items).toHaveLength(1);
        expect(refundedCart.items[0].product.name).toBe('Apple');
        expect(refundedCart.footer.total).toBe(5);
    });

    it('preserves remaining discounted pricing when rebuilding a partially refunded cart', async () => {
        const refundedCart = await OrderEntityMapper.fromRefundedCart(
            {
                id: 'e-1',
                firstName: 'Test',
                lastName: 'Cashier',
            },
            {
                id: 'o-2',
                orderNo: '51-TEST-0002',
                items: [
                    {
                        identifier: 'line-1',
                        quantity: 1,
                        product: {
                            id: 'p-1',
                            name: 'Discounted Apple',
                            price: 10,
                            unitOfMeasure: 'EA',
                            barcode: null,
                            sku: null,
                            isEBTEligible: true,
                            taxable: true,
                        },
                    },
                ],
                footer: {
                    baseSubtotal: 20,
                    discount: 5,
                    lineDiscountTotal: 2,
                    orderDiscountTotal: 3,
                    subtotal: 15,
                    tax: 1.5,
                    savingsTotal: 5,
                    total: 16.5,
                    pricingSource: 'OFFLINE_LOCAL',
                    reconciliationStatus: 'PENDING',
                },
                promoCodes: [{ code: 'SAVE5' }],
                appliedDiscountSummary: {
                    applications: [],
                    approvalEvents: [],
                    lineSummaries: [
                        {
                            lineId: 'line-1',
                            discounts: [
                                {
                                    discountApplicationId: 'manual-line-1',
                                    applicationType: 'MANUAL_LINE_DISCOUNT',
                                    scope: 'LINE',
                                    method: 'PERCENT',
                                    name: 'Manual line',
                                    source: 'manual',
                                    value: 10,
                                    originalAmount: 20,
                                    discountAmount: 2,
                                    finalAmount: 18,
                                    quantityBasis: 2,
                                    appliedAt: '2026-04-18T00:00:00.000Z',
                                    stackMode: 'STACKABLE',
                                },
                            ],
                            lineDiscountTotal: 2,
                            allocatedOrderDiscountTotal: 3,
                            lineTotalBeforeTax: 15,
                        },
                    ],
                    orderLevelAdjustments: [
                        {
                            discountApplicationId: 'manual-order',
                            applicationType: 'MANUAL_ORDER_DISCOUNT',
                            scope: 'ORDER',
                            method: 'AMOUNT',
                            name: 'Manual order',
                            source: 'manual',
                            value: 3,
                            originalAmount: 18,
                            discountAmount: 3,
                            finalAmount: 15,
                            appliedAt: '2026-04-18T00:00:00.000Z',
                            stackMode: 'STACKABLE',
                        },
                    ],
                    warnings: [],
                    pricingGeneratedAt: '2026-04-18T00:00:00.000Z',
                },
                definitions: [],
                manualDiscounts: [],
                priceOverrides: [],
                approvalEvents: [],
                selected: undefined,
                header: undefined,
            },
            [{ identifier: 'line-1', quantity: 1 }]
        );

        expect(refundedCart.footer).toMatchObject({
            baseSubtotal: 10,
            lineDiscountTotal: 1,
            orderDiscountTotal: 1.5,
            discount: 2.5,
            subtotal: 7.5,
            tax: 0.75,
            total: 8.25,
            savingsTotal: 2.5,
        });
        expect(refundedCart.items[0].product.taxable).toBe(true);
        expect(refundedCart.promoCodes).toEqual([{ code: 'SAVE5' }]);
        expect(refundedCart.manualDiscounts).toEqual([
            expect.objectContaining({
                kind: 'MANUAL_DISCOUNT',
                scope: 'LINE',
                lineId: 'line-1',
                value: 10,
            }),
            expect.objectContaining({
                kind: 'MANUAL_DISCOUNT',
                scope: 'ORDER',
                value: 3,
            }),
        ]);
        expect(refundedCart.appliedDiscountSummary?.lineSummaries[0]).toMatchObject({
            lineDiscountTotal: 1,
            allocatedOrderDiscountTotal: 1.5,
            lineTotalBeforeTax: 7.5,
        });
    });
});
