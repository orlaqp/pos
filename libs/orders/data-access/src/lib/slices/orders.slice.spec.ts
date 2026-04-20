/* eslint-disable @nx/enforce-module-boundaries */
import { printReceipt } from '@pos/printings/data-access';
import { OrderService } from '../order.service';
import {
    initialOrdersState,
    ordersActions,
    ordersReducer,
    payOrder,
    submitOrderAndPay,
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

jest.mock('@pos/products/data-access', () => ({
    productsActions: {
        applyQuantityDeltas: (payload: unknown) => ({
            type: 'products/applyQuantityDeltas',
            payload,
        }),
    },
}));

jest.mock('../order.service', () => ({
    OrderService: {
        create: jest.fn(),
        createPaidOrder: jest.fn(),
        update: jest.fn(),
        closeOrder: jest.fn(),
        closeExistingOrder: jest.fn(),
        search: jest.fn((items: any[], options: { status: string; filter?: string }) =>
            items.filter((item) => {
                const statusMatch = item.status === options.status;
                const filterMatch = !options.filter || item.orderNo?.includes(options.filter);
                return statusMatch && filterMatch;
            })
        ),
    },
}));

describe('orders reducer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('creates directly when a preallocated order id belongs to a new cart', async () => {
        const createMock = jest.mocked(OrderService.create);
        const updateMock = jest.mocked(OrderService.update);
        const dispatch = jest.fn();
        const getState = () =>
            ({
                employees: {
                    loginEmployee: {
                        id: 'employee-1',
                        firstName: 'Test',
                        lastName: 'Cashier',
                    },
                },
            }) as any;

        createMock.mockResolvedValueOnce({
            id: 'generated-cart-id',
            orderNo: '51-EMP-260330-0001',
            status: 'OPEN',
        } as any);

        const result = await upsertOrder(
            {
                cart: {
                    id: 'generated-cart-id',
                    orderNo: '51-EMP-260330-0001',
                } as any,
            },
            { requestId: 'request-id' } as any
        )(dispatch, getState, undefined);

        expect(updateMock).not.toHaveBeenCalled();
        expect(createMock).toHaveBeenCalledWith(
            expect.objectContaining({
                order: expect.objectContaining({
                    id: 'generated-cart-id',
                    orderNo: '51-EMP-260330-0001',
                }),
            })
        );
        expect(result.type).toBe('order/save/fulfilled');
        expect(result.payload).toEqual(
            expect.objectContaining({
                order: expect.objectContaining({
                    id: 'generated-cart-id',
                    orderNo: '51-EMP-260330-0001',
                }),
            })
        );
    });

    it('falls back to create when an existing-looking cart id cannot be updated', async () => {
        const createMock = jest.mocked(OrderService.create);
        const updateMock = jest.mocked(OrderService.update);
        const dispatch = jest.fn();
        const getState = () =>
            ({
                employees: {
                    loginEmployee: {
                        id: 'employee-1',
                        firstName: 'Test',
                        lastName: 'Cashier',
                    },
                },
            }) as any;

        updateMock.mockResolvedValueOnce(null);
        createMock.mockResolvedValueOnce({
            id: 'persisted-order-id',
            orderNo: '51-EMP-260330-0002',
            status: 'OPEN',
        } as any);

        const result = await upsertOrder(
            {
                cart: {
                    id: 'persisted-order-id',
                    orderNo: '51-EMP-260330-0002',
                    header: {
                        orderNumber: 'persisted-order-id',
                        orderDate: '2026-03-30T00:00:00.000Z',
                        employeeId: 'employee-1',
                        employeeName: 'Test Cashier',
                        status: 'OPEN',
                    },
                } as any,
            },
            { requestId: 'request-id' } as any
        )(dispatch, getState, undefined);

        expect(updateMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'persisted-order-id',
                order: expect.objectContaining({
                    id: 'persisted-order-id',
                    orderNo: '51-EMP-260330-0002',
                }),
            })
        );
        expect(createMock).toHaveBeenCalledWith(
            expect.objectContaining({
                order: expect.objectContaining({
                    id: 'persisted-order-id',
                    orderNo: '51-EMP-260330-0002',
                }),
            })
        );
        expect(result.type).toBe('order/save/fulfilled');
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

    it('tracks refunded amounts and refunded quantities by order id', () => {
        let state = ordersReducer(
            undefined,
            ordersActions.setRefundRecords([
                {
                    id: 'refund-1',
                    orderId: 'order-1',
                    refundAmount: 24.99,
                },
                {
                    id: 'refund-2',
                    orderId: 'order-1',
                    refundAmount: 10,
                },
                {
                    id: 'refund-3',
                    orderId: 'order-2',
                    refundAmount: 5,
                },
            ] as any)
        );

        expect(state.refundedAmountsByOrderId).toEqual({
            'order-1': 34.99,
            'order-2': 5,
        });

        state = ordersReducer(
            state,
            ordersActions.setRefundLineRecords([
                {
                    id: 'refund-line-1',
                    orderId: 'order-1',
                    orderLineIdentifier: 'line-1',
                    quantityRefunded: 1,
                },
                {
                    id: 'refund-line-2',
                    orderId: 'order-1',
                    orderLineIdentifier: 'line-1',
                    quantityRefunded: 2,
                },
                {
                    id: 'refund-line-3',
                    orderId: 'order-1',
                    orderLineIdentifier: 'line-2',
                    quantityRefunded: 0.5,
                },
            ] as any)
        );

        expect(state.refundedQuantitiesByOrderId).toEqual({
            'order-1': {
                'line-1': 3,
                'line-2': 0.5,
            },
        });
    });

    it('reconciles incoming order snapshots without rebuilding unchanged rows', () => {
        let state = ordersReducer(
            undefined,
            ordersActions.setAll([
                { id: 'o2', status: 'OPEN', orderNo: 'N2', createdAt: '2026-04-01T00:00:00.000Z' } as any,
                { id: 'o1', status: 'OPEN', orderNo: 'N1', createdAt: '2026-03-31T00:00:00.000Z' } as any,
            ])
        );

        state = ordersReducer(
            state,
            ordersActions.setAll([
                { id: 'o2', status: 'PAID', orderNo: 'N2', createdAt: '2026-04-01T00:00:00.000Z' } as any,
                { id: 'o3', status: 'OPEN', orderNo: 'N3', createdAt: '2026-04-02T00:00:00.000Z' } as any,
            ])
        );

        expect(state.ids).toEqual(['o2', 'o3']);
        expect(state.entities['o2']).toEqual(
            expect.objectContaining({ id: 'o2', status: 'PAID' })
        );
        expect(state.entities['o3']).toEqual(
            expect.objectContaining({ id: 'o3', orderNo: 'N3' })
        );
        expect(state.entities['o1']).toBeUndefined();
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

    it('returns a paid order from submitOrderAndPay without relying on a second lookup', async () => {
        const createPaidOrderMock = jest.mocked(OrderService.createPaidOrder);
        const dispatch = jest.fn();
        const getState = () =>
            ({
                employees: {
                    loginEmployee: {
                        id: 'employee-1',
                        firstName: 'Test',
                        lastName: 'Cashier',
                    },
                },
            }) as any;

        createPaidOrderMock.mockResolvedValueOnce({
            id: 'created-order-id',
            orderNo: '51-EMP-260330-0009',
            status: 'PAID',
        } as any);

        const result = await submitOrderAndPay(
            {
                cart: {
                    id: 'generated-cart-id',
                    orderNo: '51-EMP-260330-0009',
                } as any,
                payments: [{ type: 'cash', amount: 10 }],
            },
            { requestId: 'request-id' } as any
        )(dispatch, getState, undefined);

        expect(createPaidOrderMock).toHaveBeenCalledWith(
            expect.objectContaining({
                by: expect.objectContaining({
                    id: 'employee-1',
                }),
                order: expect.objectContaining({
                    id: 'generated-cart-id',
                }),
                payments: [{ type: 'cash', amount: 10 }],
            })
        );
        expect(result.type).toBe('order/submitAndPay/fulfilled');
        expect(result.payload).toEqual(
            expect.objectContaining({
                order: expect.objectContaining({
                    id: 'created-order-id',
                    status: 'PAID',
                }),
            })
        );
        expect(dispatch).toHaveBeenCalledWith({
            type: 'products/applyQuantityDeltas',
            payload: [],
        });
    });

    it('optimistically removes a paid order from the OPEN filtered list and can restore it on failure', () => {
        let state = ordersReducer(
            undefined,
            ordersActions.setAll([
                { id: 'o1', status: 'OPEN', orderNo: 'N1' } as any,
                { id: 'o2', status: 'OPEN', orderNo: 'N2' } as any,
            ])
        );

        state = ordersReducer(
            state,
            ordersActions.optimisticMarkPaid({
                id: 'o1',
                payments: [{ type: 'cash', amount: 5 }] as any,
                employeeId: 'employee-1',
                employeeName: 'Cashier',
            })
        );

        expect(state.entities.o1).toEqual(
            expect.objectContaining({
                id: 'o1',
                status: 'PAID',
                paymentInfo: expect.objectContaining({
                    employeeId: 'employee-1',
                    employeeName: 'Cashier',
                }),
            })
        );
        expect(state.filteredList).toEqual([
            expect.objectContaining({ id: 'o2', status: 'OPEN' }),
        ]);

        state = ordersReducer(
            state,
            ordersActions.optimisticRestoreOpen({
                id: 'o1',
            })
        );

        expect(state.entities.o1).toEqual(
            expect.objectContaining({
                id: 'o1',
                status: 'OPEN',
                paymentInfo: null,
            })
        );
        expect(state.filteredList).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: 'o1', status: 'OPEN' }),
                expect.objectContaining({ id: 'o2', status: 'OPEN' }),
            ])
        );
    });

    it('keeps an optimistically paid order out of OPEN even if a stale sync snapshot still says OPEN', () => {
        let state = ordersReducer(
            undefined,
            ordersActions.setAll([
                { id: 'o1', status: 'OPEN', orderNo: 'N1' } as any,
                { id: 'o2', status: 'OPEN', orderNo: 'N2' } as any,
            ])
        );

        state = ordersReducer(
            state,
            ordersActions.optimisticMarkPaid({
                id: 'o1',
                payments: [{ type: 'cash', amount: 5 }] as any,
                employeeId: 'employee-1',
                employeeName: 'Cashier',
            })
        );

        state = ordersReducer(
            state,
            ordersActions.setAll([
                { id: 'o1', status: 'OPEN', orderNo: 'N1' } as any,
                { id: 'o2', status: 'OPEN', orderNo: 'N2' } as any,
            ])
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
    });

    it('keeps one-step paid orders out of OPEN until synced PAID arrives', () => {
        let state = ordersReducer(
            undefined,
            ordersActions.setAll([
                { id: 'o1', status: 'OPEN', orderNo: 'N1' } as any,
            ])
        );

        state = ordersReducer(
            state,
            submitOrderAndPay.fulfilled(
                {
                    cart: { id: 'o1' } as any,
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

        state = ordersReducer(
            state,
            ordersActions.setAll([
                { id: 'o1', status: 'OPEN', orderNo: 'N1' } as any,
            ])
        );

        expect(state.entities.o1).toEqual(
            expect.objectContaining({
                id: 'o1',
                status: 'PAID',
            })
        );
        expect(state.filteredList).toEqual([]);

        state = ordersReducer(
            state,
            ordersActions.setAll([
                { id: 'o1', status: 'PAID', orderNo: 'N1' } as any,
            ])
        );

        expect(state.entities.o1).toEqual(
            expect.objectContaining({
                id: 'o1',
                status: 'PAID',
            })
        );
    });

    it('clears a stale PAID override when a synced order becomes partially refunded', () => {
        let state = ordersReducer(
            undefined,
            ordersActions.setAll([
                { id: 'o1', status: 'OPEN', orderNo: 'N1' } as any,
            ])
        );

        state = ordersReducer(
            state,
            ordersActions.optimisticMarkPaid({
                id: 'o1',
                payments: [{ type: 'cash', amount: 5 }] as any,
                employeeId: 'employee-1',
                employeeName: 'Cashier',
            })
        );

        state = ordersReducer(
            state,
            ordersActions.setAll([
                {
                    id: 'o1',
                    status: 'PARTIALLY_REFUNDED',
                    orderNo: 'N1',
                } as any,
            ])
        );

        expect(state.entities.o1).toEqual(
            expect.objectContaining({
                id: 'o1',
                status: 'PARTIALLY_REFUNDED',
            })
        );
        expect(state.pendingStatusOverrides.o1).toBeUndefined();
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
