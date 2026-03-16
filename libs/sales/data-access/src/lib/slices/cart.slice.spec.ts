import {
    cartActions,
    cartReducer,
    initialCartState,
    selectActiveProduct,
    selectCart,
} from './cart.slice';

jest.mock('react-native-uuid', () => ({
    v4: jest.fn(() => 'uuid-1'),
}));

const eachProduct = {
    id: 'p-each',
    name: 'Apple',
    price: 2.5,
    unitOfMeasure: 'EA',
    isEBTEligible: true,
};

const weightProduct = {
    id: 'p-weight',
    name: 'Bulk Rice',
    price: 3.5,
    unitOfMeasure: 'LB',
    isEBTEligible: false,
};

describe('cart.slice', () => {
    it('returns initial state', () => {
        expect(cartReducer(undefined, { type: 'unknown' })).toEqual(
            initialCartState
        );
    });

    it('selects and resets selected item', () => {
        const selected = { identifier: 'x', product: eachProduct, quantity: 1 } as any;
        let state = cartReducer(undefined, cartActions.select(selected));
        expect(state.selected).toEqual(selected);

        state = cartReducer(state, cartActions.select(undefined));
        expect(state.selected).toBeUndefined();
    });

    it('tracks active product independently from selected cart line', () => {
        const selected = { identifier: 'x', product: eachProduct, quantity: 1 } as any;
        const activeProduct = { product: weightProduct, quantity: 0 } as any;
        let state = cartReducer(undefined, cartActions.select(selected));
        state = cartReducer(state, cartActions.setActiveProduct(activeProduct));

        expect(state.selected).toEqual(selected);
        expect(state.activeProduct).toEqual(activeProduct);
    });

    it('adds first product and computes totals', () => {
        const state = cartReducer(
            undefined,
            cartActions.upsert({
                product: eachProduct as any,
                quantity: 2,
            } as any)
        );

        expect(state.items).toHaveLength(1);
        expect(state.items[0].identifier).toBe('uuid-1');
        expect(state.footer.subtotal).toBe(5);
        expect(state.footer.total).toBe(5);
    });

    it('updates existing line by identifier', () => {
        const base = {
            ...initialCartState,
            items: [
                { identifier: 'line-1', product: eachProduct as any, quantity: 1 },
            ],
        };
        const state = cartReducer(
            base as any,
            cartActions.upsert({
                identifier: 'line-1',
                product: eachProduct as any,
                quantity: 4,
            } as any)
        );

        expect(state.items).toHaveLength(1);
        expect(state.items[0].quantity).toBe(4);
        expect(state.footer.total).toBe(10);
    });

    it('merges EACH quantities on repeated add', () => {
        const base = {
            ...initialCartState,
            items: [
                { identifier: 'line-1', product: eachProduct as any, quantity: 1 },
            ],
        };
        const state = cartReducer(
            base as any,
            cartActions.upsert({
                product: eachProduct as any,
                quantity: 2,
            } as any)
        );

        expect(state.items).toHaveLength(1);
        expect(state.items[0].quantity).toBe(3);
        expect(state.footer.total).toBe(7.5);
    });

    it('for non-EACH product: inserts new line when quantity is zero', () => {
        const base = {
            ...initialCartState,
            items: [
                { identifier: 'line-1', product: weightProduct as any, quantity: 1.2 },
            ],
        };
        const state = cartReducer(
            base as any,
            cartActions.upsert({
                product: weightProduct as any,
                quantity: 0,
            } as any)
        );

        expect(state.items).toHaveLength(2);
    });

    it('for non-EACH product: replaces existing zero-quantity line first', () => {
        const base = {
            ...initialCartState,
            items: [
                { identifier: 'line-1', product: weightProduct as any, quantity: 0 },
                { identifier: 'line-2', product: weightProduct as any, quantity: 1.2 },
            ],
        };
        const state = cartReducer(
            base as any,
            cartActions.upsert({
                product: weightProduct as any,
                quantity: 2.5,
            } as any)
        );

        expect(state.items).toHaveLength(2);
        expect(state.items[0].quantity).toBe(2.5);
    });

    it('for non-EACH product: inserts a fresh line when no zero-quantity placeholder exists', () => {
        const base = {
            ...initialCartState,
            items: [
                { identifier: 'line-1', product: weightProduct as any, quantity: 1.2 },
            ],
        };
        const state = cartReducer(
            base as any,
            cartActions.upsert({
                product: weightProduct as any,
                quantity: 2.5,
            } as any)
        );

        expect(state.items).toHaveLength(2);
        expect(state.items[1].quantity).toBe(2.5);
    });

    it('removes product and updates totals', () => {
        const base = {
            ...initialCartState,
            items: [
                { identifier: 'line-1', product: eachProduct as any, quantity: 2 },
                { identifier: 'line-2', product: weightProduct as any, quantity: 1 },
            ],
            footer: { subtotal: 8.5, tax: 0, discount: 0, total: 8.5 },
        };

        const state = cartReducer(
            base as any,
            cartActions.removeProduct(base.items[0] as any)
        );

        expect(state.items).toHaveLength(1);
        expect(state.footer.total).toBe(3.5);
    });

    it('sets and resets cart from order payload', () => {
        const order = {
            id: 'order-1',
            orderNo: '51-AAA-260313-0001',
            subtotal: 10,
            tax: 0,
            total: 10,
            status: 'OPEN',
            employeeId: 'e-1',
            employeeName: 'Cashier',
            orderDate: '2026-03-13T10:00:00.000Z',
            lines: [
                {
                    identifier: 'line-1',
                    quantity: 4,
                    productId: 'p-each',
                    productName: 'Apple',
                    price: 2.5,
                    unitOfMeasure: 'EA',
                    isEBTEligible: true,
                },
            ],
        };

        let state = cartReducer(undefined, cartActions.set(order as any));
        expect(state.id).toBe('order-1');
        expect(state.orderNo).toBe('51-AAA-260313-0001');
        expect(state.items).toHaveLength(1);
        expect(state.items[0].product.name).toBe('Apple');
        expect(state.payments).toEqual([]);

        state = cartReducer(state, cartActions.reset());
        expect(state).toMatchObject(initialCartState);
        expect(state.orderNo).toBeUndefined();
        expect(state.payments).toEqual([]);
    });

    it('stores footer payments with addPayment', () => {
        const payments = [
            { type: 'CASH', amount: 5 },
            { type: 'EBT', amount: 2.5 },
        ];
        const state = cartReducer(undefined, cartActions.addPayment(payments as any));
        expect(state.footer.payments).toEqual(payments);
    });

    it('applies and replaces manual order discounts', () => {
        let state = cartReducer(
            {
                ...initialCartState,
                items: [{ identifier: 'line-1', product: eachProduct as any, quantity: 2 }],
                policy: { canApplyOrderDiscount: true, canUsePromoCodes: true } as any,
            } as any,
            cartActions.applyManualDiscount({
                kind: 'MANUAL_DISCOUNT',
                scope: 'ORDER',
                method: 'AMOUNT',
                value: 2,
                name: 'Order discount',
            } as any)
        );

        state = cartReducer(
            state,
            cartActions.applyManualDiscount({
                kind: 'MANUAL_DISCOUNT',
                scope: 'ORDER',
                method: 'AMOUNT',
                value: 3,
                name: 'Order discount replacement',
            } as any)
        );

        expect(state.manualDiscounts).toHaveLength(1);
        expect(state.manualDiscounts[0].value).toBe(3);
    });

    it('reprices when pricing context changes', () => {
        const base = {
            ...initialCartState,
            items: [
                {
                    identifier: 'line-1',
                    product: { ...eachProduct, categoryId: 'oils' } as any,
                    quantity: 1,
                },
            ],
            definitions: [
                {
                    id: 'store-only',
                    name: 'Store only',
                    status: 'ACTIVE',
                    type: 'AUTOMATIC',
                    method: 'PERCENT',
                    scope: 'LINE',
                    value: 10,
                    stackMode: 'STACKABLE',
                    applicableCategoryIds: ['oils'],
                    storeIds: ['store-1'],
                },
            ] as any,
        };

        const noMatch = cartReducer(
            base as any,
            cartActions.setPricingContext({ storeId: 'store-2' } as any)
        );
        const matched = cartReducer(
            noMatch,
            cartActions.setPricingContext({ storeId: 'store-1' } as any)
        );

        expect(noMatch.footer.discount).toBe(0);
        expect(matched.footer.discount).toBe(0.25);
    });

    it('applies line manual discounts and price overrides and removes the conflicting line discount', () => {
        let state = cartReducer(
            {
                ...initialCartState,
                items: [{ identifier: 'line-1', product: eachProduct as any, quantity: 2 }],
                policy: { canOverridePrice: true } as any,
            } as any,
            cartActions.applyManualDiscount({
                kind: 'MANUAL_DISCOUNT',
                scope: 'LINE',
                lineId: 'line-1',
                method: 'PERCENT',
                value: 10,
            } as any)
        );

        expect(state.manualDiscounts).toHaveLength(1);

        state = cartReducer(
            state,
            cartActions.applyPriceOverride({
                kind: 'PRICE_OVERRIDE',
                lineId: 'line-1',
                finalPrice: 1.5,
            } as any)
        );

        expect(state.priceOverrides).toHaveLength(1);
        expect(state.manualDiscounts).toEqual([]);
    });

    it('normalizes promo codes and removes pricing adjustments', () => {
        let state = cartReducer(
            {
                ...initialCartState,
                items: [{ identifier: 'line-1', product: eachProduct as any, quantity: 2 }],
                policy: { canUsePromoCodes: true } as any,
            } as any,
            cartActions.addPromoCode({ code: ' save5 ' } as any)
        );

        state = cartReducer(state, cartActions.addPromoCode({ code: 'SAVE5' } as any));
        expect(state.promoCodes).toEqual([{ code: 'SAVE5' }]);

        state = cartReducer(
            {
                ...state,
                manualDiscounts: [
                    {
                        kind: 'MANUAL_DISCOUNT',
                        scope: 'LINE',
                        lineId: 'line-1',
                        method: 'AMOUNT',
                        value: 1,
                    },
                    {
                        kind: 'MANUAL_DISCOUNT',
                        scope: 'ORDER',
                        method: 'AMOUNT',
                        value: 2,
                    },
                ],
                priceOverrides: [
                    {
                        kind: 'PRICE_OVERRIDE',
                        lineId: 'line-1',
                        finalPrice: 1.5,
                    },
                ],
            } as any,
            cartActions.removePricingAdjustment({
                lineId: 'line-1',
                scope: 'ORDER',
                promoCode: 'save5',
            } as any)
        );

        expect(state.promoCodes).toEqual([]);
        expect(state.manualDiscounts).toEqual([]);
        expect(state.priceOverrides).toEqual([]);
    });

    it('stores policy and approval events', () => {
        let state = cartReducer(undefined, cartActions.setPolicy({ canUsePromoCodes: true } as any));
        state = cartReducer(
            state,
            cartActions.addApprovalEvent({
                id: 'approval-1',
                status: 'APPROVED',
            } as any)
        );

        expect(state.policy).toEqual({ canUsePromoCodes: true });
        expect(state.approvalEvents).toEqual([{ id: 'approval-1', status: 'APPROVED' }]);
    });

    it('applies automatic definitions when pricing rules are loaded', () => {
        const state = cartReducer(
            {
                ...initialCartState,
                items: [{ identifier: 'line-1', product: eachProduct as any, quantity: 2 }],
            } as any,
            cartActions.setDefinitions([
                {
                    id: 'auto-1',
                    name: 'Apple auto',
                    status: 'ACTIVE',
                    type: 'AUTOMATIC',
                    method: 'PERCENT',
                    scope: 'LINE',
                    value: 10,
                    stackMode: 'STACKABLE',
                    applicableProductIds: ['p-each'],
                    active: true,
                },
            ] as any)
        );

        expect(state.footer.discount).toBe(0.5);
        expect(state.footer.total).toBe(4.5);
        expect(state.appliedDiscountSummary?.applications).toHaveLength(1);
    });

    it('replaces line manual discounts and price overrides for the same line', () => {
        let state = cartReducer(
            {
                ...initialCartState,
                items: [{ identifier: 'line-1', product: eachProduct as any, quantity: 1 }],
            } as any,
            cartActions.applyManualDiscount({
                kind: 'MANUAL_DISCOUNT',
                scope: 'LINE',
                lineId: 'line-1',
                method: 'AMOUNT',
                value: 1,
            } as any)
        );

        state = cartReducer(
            state,
            cartActions.applyManualDiscount({
                kind: 'MANUAL_DISCOUNT',
                scope: 'LINE',
                lineId: 'line-1',
                method: 'AMOUNT',
                value: 2,
            } as any)
        );

        expect(state.manualDiscounts).toEqual([
            {
                kind: 'MANUAL_DISCOUNT',
                scope: 'LINE',
                lineId: 'line-1',
                method: 'AMOUNT',
                value: 2,
            },
        ]);

        state = cartReducer(
            state,
            cartActions.applyPriceOverride({
                kind: 'PRICE_OVERRIDE',
                lineId: 'line-1',
                finalPrice: 2,
            } as any)
        );

        state = cartReducer(
            state,
            cartActions.applyPriceOverride({
                kind: 'PRICE_OVERRIDE',
                lineId: 'line-1',
                finalPrice: 1.5,
            } as any)
        );

        expect(state.priceOverrides).toEqual([
            { kind: 'PRICE_OVERRIDE', lineId: 'line-1', finalPrice: 1.5 },
        ]);
    });

    it('ignores malformed applied discount summary when restoring cart from order payload', () => {
        const state = cartReducer(
            undefined,
            cartActions.set({
                id: 'order-2',
                orderNo: '51-AAA-260313-0002',
                subtotal: 10,
                tax: 0,
                total: 10,
                status: 'OPEN',
                employeeId: 'e-1',
                employeeName: 'Cashier',
                orderDate: '2026-03-13T10:00:00.000Z',
                appliedDiscountSummary: '{"broken":',
                lines: [
                    {
                        identifier: 'line-1',
                        quantity: 1,
                        productId: 'p-each',
                        productName: 'Apple',
                        price: 2.5,
                        unitOfMeasure: 'EA',
                        isEBTEligible: true,
                    },
                ],
            } as any)
        );

        expect(state.appliedDiscountSummary).toBeUndefined();
    });

    it('filters nullable promo codes and keeps object discount summaries on restore', () => {
        const summary = { applications: [], warnings: [] };
        const state = cartReducer(
            undefined,
            cartActions.set({
                id: 'order-3',
                orderNo: '51-AAA-260313-0003',
                subtotal: 10,
                tax: 0,
                total: 10,
                status: 'OPEN',
                employeeId: 'e-1',
                employeeName: 'Cashier',
                orderDate: '2026-03-13T10:00:00.000Z',
                promoCodes: ['SAVE5', null],
                appliedDiscountSummary: summary,
                lines: [
                    {
                        identifier: 'line-1',
                        quantity: 1,
                        productId: 'p-each',
                        productName: 'Apple',
                        price: 2.5,
                        unitOfMeasure: 'EA',
                        isEBTEligible: true,
                    },
                ],
            } as any)
        );

        expect(state.promoCodes).toEqual([{ code: 'SAVE5' }]);
        expect(state.appliedDiscountSummary).toEqual(summary);
    });

    it('ignores non-json summary strings and payloads without lines', () => {
        let state = cartReducer(
            undefined,
            cartActions.set({
                id: 'order-4',
                subtotal: 10,
                tax: 0,
                total: 10,
                status: 'OPEN',
                employeeId: 'e-1',
                employeeName: 'Cashier',
                orderDate: '2026-03-13T10:00:00.000Z',
                appliedDiscountSummary: 'not-json',
                lines: [
                    {
                        identifier: 'line-1',
                        quantity: 1,
                        productId: 'p-each',
                        productName: 'Apple',
                        price: 2.5,
                        unitOfMeasure: 'EA',
                        isEBTEligible: true,
                    },
                ],
            } as any)
        );

        expect(state.appliedDiscountSummary).toBeUndefined();

        state = cartReducer(
            {
                ...state,
                items: [{ identifier: 'line-1', product: eachProduct as any, quantity: 1 }],
            } as any,
            cartActions.set({
                id: 'ignored',
                subtotal: 10,
                tax: 0,
                total: 10,
                status: 'OPEN',
                employeeId: 'e-1',
                employeeName: 'Cashier',
            } as any)
        );

        expect(state.id).toBe('order-4');
        expect(state.items).toHaveLength(1);
    });

    it('ignores blank promo codes, removes explicit promo codes, and clears line-linked pricing data on remove', () => {
        let state = cartReducer(
            {
                ...initialCartState,
                items: [{ identifier: 'line-1', product: eachProduct as any, quantity: 1 }],
            } as any,
            cartActions.addPromoCode({ code: '   ' } as any)
        );

        expect(state.promoCodes).toEqual([]);

        state = cartReducer(state, cartActions.addPromoCode({ code: 'SAVE5' } as any));
        state = cartReducer(state, cartActions.removePromoCode('save5'));
        expect(state.promoCodes).toEqual([]);

        state = cartReducer(
            {
                ...state,
                manualDiscounts: [
                    {
                        kind: 'MANUAL_DISCOUNT',
                        scope: 'LINE',
                        lineId: 'line-1',
                        method: 'AMOUNT',
                        value: 1,
                    },
                ],
                priceOverrides: [
                    {
                        kind: 'PRICE_OVERRIDE',
                        lineId: 'line-1',
                        finalPrice: 1.5,
                    },
                ],
            } as any,
            cartActions.removeProduct({
                identifier: 'line-1',
                product: eachProduct as any,
                quantity: 1,
            } as any)
        );

        expect(state.manualDiscounts).toEqual([]);
        expect(state.priceOverrides).toEqual([]);
    });

    it('selectors return expected values', () => {
        const selected = { identifier: 'line-1', product: eachProduct, quantity: 1 };
        const activeProduct = { product: weightProduct, quantity: 0 };
        const state = {
            cart: {
                ...initialCartState,
                selected,
                activeProduct,
                items: [selected],
            },
        } as any;

        expect(selectActiveProduct(state)).toEqual(activeProduct);
        expect(selectCart(state)).toEqual(state.cart);
    });
});
