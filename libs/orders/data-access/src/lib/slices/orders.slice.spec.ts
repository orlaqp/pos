/* eslint-disable @nx/enforce-module-boundaries */
import { printReceipt } from '@pos/printings/data-access';
import {
    initialOrdersState,
    ordersActions,
    ordersReducer,
    payOrder,
    upsertOrder,
} from './orders.slice';

jest.mock('react-native-localize', () => ({
    findBestLanguageTag: jest.fn(() => ({
        languageTag: 'en',
        isRTL: false,
    })),
}));

jest.mock('@pos/printings/data-access', () => ({
    printReceipt: jest.fn(),
}));

describe('orders reducer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns initial state', () => {
        expect(ordersReducer(undefined, { type: '' })).toEqual(initialOrdersState);
    });

    it('handles setAll, filter, and remove', () => {
        const items = [
            { id: 'o1', status: 'OPEN', orderNo: 'N1' },
            { id: 'o2', status: 'PAID', orderNo: 'N2' },
        ] as any[];
        let state = ordersReducer(undefined, ordersActions.setAll(items as any));
        expect(state.loadingStatus).toBe('loaded');
        expect(state.ids).toHaveLength(2);

        state = ordersReducer(state, ordersActions.filter({ status: 'OPEN' } as any));
        expect(state.filterQuery).toEqual({ status: 'OPEN' });
        expect(state.filteredList).toEqual([
            expect.objectContaining({ id: 'o1', status: 'OPEN' }),
        ]);

        state = ordersReducer(state, ordersActions.remove('o2'));
        expect(state.entities['o2']).toBeUndefined();
    });

    it('upserts the saved order, refreshes the filtered list, and prints customer copy by default', () => {
        const baseState = ordersReducer(
            undefined,
            ordersActions.setAll([{ id: 'o1', status: 'OPEN', orderNo: 'N1' } as any])
        );

        const state = ordersReducer(
            baseState,
            upsertOrder.fulfilled(
                {
                    cart: { id: 'o1' } as any,
                    defaultPrinter: { id: 'printer-1' } as any,
                    storeInfo: { name: 'Test Store' } as any,
                    order: {
                        id: 'o1',
                        status: 'OPEN',
                        orderNo: 'N1-UPDATED',
                    } as any,
                },
                'request-id',
                { cart: { id: 'o1' } } as any
            )
        );

        expect(state.entities.o1).toEqual(
            expect.objectContaining({
                id: 'o1',
                orderNo: 'N1-UPDATED',
            })
        );
        expect(state.filteredList).toEqual([
            expect.objectContaining({ id: 'o1', status: 'OPEN' }),
        ]);
        expect(printReceipt).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'Test Store' }),
            expect.objectContaining({ id: 'printer-1' }),
            expect.anything(),
            expect.objectContaining({ copyType: 'CUSTOMER' })
        );
    });

    it('skips fallback printing when skipAutoPrint is true', () => {
        const state = ordersReducer(
            initialOrdersState,
            upsertOrder.fulfilled(
                {
                    cart: { id: 'o1' } as any,
                    defaultPrinter: { id: 'printer-1' } as any,
                    storeInfo: { name: 'Test Store' } as any,
                    skipAutoPrint: true,
                    order: {
                        id: 'o1',
                        status: 'OPEN',
                        orderNo: 'N1',
                    } as any,
                },
                'request-id',
                { cart: { id: 'o1' } } as any
            )
        );

        expect(state.submitStatus).toBe('saved');
        expect(printReceipt).not.toHaveBeenCalled();
    });

    it('moves a paid order out of the OPEN filtered list and prints merchant copy by default', () => {
        const baseState = ordersReducer(
            undefined,
            ordersActions.setAll([
                { id: 'o1', status: 'OPEN', orderNo: 'N1' } as any,
                { id: 'o2', status: 'OPEN', orderNo: 'N2' } as any,
            ])
        );

        const state = ordersReducer(
            baseState,
            payOrder.fulfilled(
                {
                    cart: { id: 'o1' } as any,
                    defaultPrinter: { id: 'printer-1' } as any,
                    storeInfo: { name: 'Test Store' } as any,
                    order: {
                        id: 'o1',
                        status: 'PAID',
                        orderNo: 'N1',
                    } as any,
                },
                'request-id',
                { cart: { id: 'o1' }, payments: [] } as any
            )
        );

        expect(state.entities.o1).toEqual(
            expect.objectContaining({
                id: 'o1',
                status: 'PAID',
            })
        );
        expect(state.filteredList).toEqual([
            expect.objectContaining({ id: 'o2', status: 'OPEN' }),
        ]);
        expect(printReceipt).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'Test Store' }),
            expect.objectContaining({ id: 'printer-1' }),
            expect.anything(),
            expect.objectContaining({ copyType: 'MERCHANT' })
        );
    });

    it('sets submit error on rejected pay without mutating order status', () => {
        const baseState = ordersReducer(
            undefined,
            ordersActions.setAll([{ id: 'o1', status: 'OPEN', orderNo: 'N1' } as any])
        );

        const state = ordersReducer(
            baseState,
            payOrder.rejected(new Error('boom'), 'request-id', {
                cart: { id: 'o1' },
                payments: [],
            } as any)
        );

        expect(state.submitStatus).toBe('error');
        expect(state.error).toBe('boom');
        expect(state.entities.o1).toEqual(
            expect.objectContaining({ id: 'o1', status: 'OPEN' })
        );
    });
});
