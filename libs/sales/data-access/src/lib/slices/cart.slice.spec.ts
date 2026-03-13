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

    it('selectors return expected values', () => {
        const selected = { identifier: 'line-1', product: eachProduct, quantity: 1 };
        const state = {
            cart: {
                ...initialCartState,
                selected,
                items: [selected],
            },
        } as any;

        expect(selectActiveProduct(state)).toEqual(selected);
        expect(selectCart(state)).toEqual(state.cart);
    });
});
