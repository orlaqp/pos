import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { InteractionManager } from 'react-native';

jest.spyOn(InteractionManager, 'runAfterInteractions').mockImplementation((task: any) => {
    task?.();
    return { cancel: jest.fn() } as any;
});

jest.mock('@pos/shared/ui-native', () => {
    const actual = jest.requireActual('@pos/shared/ui-native');
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');

    return {
        ...actual,
        UISpinner: ({ message }: { message: string }) => <Text>{message}</Text>,
        UIDatePickerModal: ({ onConfirm, onCancel }: any) => (
            <View testID="mock-ui-date-picker-modal">
                <Pressable
                    testID="mock-ui-date-picker-confirm"
                    onPress={() => onConfirm(new Date('2026-03-12T00:00:00.000Z'))}
                >
                    <Text>confirm</Text>
                </Pressable>
                <Pressable
                    testID="mock-ui-date-picker-cancel"
                    onPress={() => onCancel?.()}
                >
                    <Text>cancel</Text>
                </Pressable>
            </View>
        ),
    };
});

import EndOfDay, {
    buildRefundedLineAmountsForOrder,
    buildEndOfDayWidgets,
    buildEndOfDayFilterConfigs,
    buildDayRange,
    createDateUpdater,
    formatPaymentAmount,
    getPaymentMethodsTotal,
    loadEndOfDayDataForRange,
    loadPaidSalesForRange,
} from './end-of-day';
import { buildEndOfDayReferenceSummary, filterOrders } from './end-of-day.service';

describe('EndOfDay', () => {
    it('should render successfully', () => {
        const screen = render(<EndOfDay />);
        expect(screen.toJSON()).toBeTruthy();
    });

    it('builds day range boundaries for selected date', () => {
        const date = new Date('2026-03-12T17:15:00.000Z');
        const range = buildDayRange(date);

        expect(range.startDate.hour()).toBe(0);
        expect(range.startDate.minute()).toBe(0);
        expect(range.endDate.hour()).toBe(23);
        expect(range.endDate.minute()).toBe(59);
    });

    it('computes and formats payment totals', () => {
        const total = getPaymentMethodsTotal({ CC: 12.5, CASH: 3, CHECK: 4.25, EBT: 1.5 });
        expect(total).toBe(21.25);
        expect(formatPaymentAmount(total)).toBe('$21.25');
    });

    it('loads paid sales and falls back to empty array', async () => {
        const fetchSales = jest
            .fn()
            .mockResolvedValueOnce([{ id: 'o-1' }])
            .mockResolvedValueOnce(undefined);

        const range = buildDayRange(new Date('2026-03-12T00:00:00.000Z'));
        await expect(loadPaidSalesForRange(range, fetchSales as any)).resolves.toEqual([
            { id: 'o-1' },
        ]);
        await expect(loadPaidSalesForRange(range, fetchSales as any)).resolves.toEqual(
            []
        );
        expect(fetchSales).toHaveBeenCalledWith(
            ['PAID', 'PARTIALLY_REFUNDED'],
            expect.anything()
        );
    });

    it('loads refund context alongside sales', async () => {
        const fetchSales = jest.fn().mockResolvedValue([{ id: 'o-1' }]);
        const fetchRefunds = jest.fn().mockResolvedValue([{ id: 'r-1' }]);
        const fetchRefundLines = jest.fn().mockResolvedValue([{ id: 'rl-1' }]);

        const range = buildDayRange(new Date('2026-03-12T00:00:00.000Z'));
        await expect(
            loadEndOfDayDataForRange(
                range,
                fetchSales as any,
                fetchRefunds as any,
                fetchRefundLines as any
            )
        ).resolves.toEqual({
            orders: [{ id: 'o-1' }],
            refunds: [{ id: 'r-1' }],
            refundLines: [{ id: 'rl-1' }],
        });
        expect(fetchRefundLines).toHaveBeenCalledWith(['r-1']);
    });

    it('builds widget definitions for summary cards', () => {
        const widgets = buildEndOfDayWidgets(
            3,
            18.5,
            2.5,
            1.5,
            1.25,
            17,
            { CC: 10, CASH: 5, CHECK: 2, EBT: 0 },
            '#111'
        );

        expect(widgets).toEqual([
            { text: 'Sales', value: '3', backgroundColor: '#111', flex: 0.7 },
            { text: 'Gross Sales', value: '$18.5', backgroundColor: '#111', flex: 1 },
            { text: 'Discounts', value: '$2.5', backgroundColor: '#5d4037', flex: 1 },
            { text: 'Refunds', value: '$1.5', backgroundColor: '#8e24aa', flex: 1 },
            { text: 'Tax', value: '$1.25', backgroundColor: '#00796b', flex: 1 },
            { text: 'Collected Sales', value: '$17', backgroundColor: '#111', flex: 1 },
            { text: 'Credit Card', value: '$10', backgroundColor: '#1976d2', flex: 1 },
            { text: 'Cash', value: '$5', backgroundColor: '#e91e63', flex: 1 },
            { text: 'Checks', value: '$2', backgroundColor: '#43a047', flex: 1 },
            { text: 'EBT', value: '$0', backgroundColor: '#00695c', flex: 1 },
        ]);
    });

    it('builds filter configs for dropdown rows', () => {
        const setters = {
            setEmployeesOpen: jest.fn(),
            setEmployeeValue: jest.fn(),
            setEmployeeItems: jest.fn(),
            setClosedByOpen: jest.fn(),
            setClosedByValue: jest.fn(),
            setProductsOpen: jest.fn(),
            setProductValue: jest.fn(),
            setProductItems: jest.fn(),
        };

        const configs = buildEndOfDayFilterConfigs({
            employeesOpen: false,
            employeeValue: '',
            employeeItems: [{ label: 'All', value: '' }] as any,
            setEmployeesOpen: setters.setEmployeesOpen as any,
            setEmployeeValue: setters.setEmployeeValue as any,
            setEmployeeItems: setters.setEmployeeItems as any,
            closedByOpen: false,
            closedByValue: '',
            setClosedByOpen: setters.setClosedByOpen as any,
            setClosedByValue: setters.setClosedByValue as any,
            productsOpen: false,
            productValue: '',
            productItems: [{ label: 'All', value: '' }] as any,
            setProductsOpen: setters.setProductsOpen as any,
            setProductValue: setters.setProductValue as any,
            setProductItems: setters.setProductItems as any,
        });

        expect(configs.map((c) => c.label)).toEqual([
            'Opened by',
            'Closed by',
            'Product(s)',
        ]);
        expect(configs[2].searchable).toBe(true);
        expect(configs[1].leftPadding).toBe(true);
    });

    it('creates a date updater that toggles loading and stores loaded orders', async () => {
        const setDate = jest.fn();
        const setLoading = jest.fn();
        const setOrders = jest.fn();
        const setFilteredOrders = jest.fn();
        const loadForRange = jest.fn().mockResolvedValue({
            orders: [{ id: 'o-2' }],
            refunds: [],
            refundLines: [],
        });

        const updateDate = createDateUpdater(
            setDate as any,
            setLoading as any,
            setOrders as any,
            setFilteredOrders as any,
            undefined,
            undefined,
            loadForRange as any
        );

        updateDate(new Date('2026-03-12T00:00:00.000Z'));
        await Promise.resolve();

        expect(setDate).toHaveBeenCalled();
        expect(setLoading).toHaveBeenNthCalledWith(1, true);
        expect(loadForRange).toHaveBeenCalledWith(expect.anything());
        expect(setOrders).toHaveBeenCalledWith([{ id: 'o-2' }]);
        expect(setFilteredOrders).toHaveBeenCalledWith([{ id: 'o-2' }]);
        expect(setLoading).toHaveBeenLastCalledWith(false);
    });

    it('builds discount and refund references from filtered orders', () => {
        expect(
            buildEndOfDayReferenceSummary(
                [
                    { id: 'o-1', total: 20, discountTotal: 3 },
                    { id: 'o-2', total: 10, discountTotal: 1, tax: 1 },
                ] as any,
                [
                    { id: 'r-1', orderId: 'o-1', refundAmount: 2.5 },
                    { id: 'r-2', orderId: 'other', refundAmount: 4 },
                ] as any,
                [],
                {}
            )
        ).toEqual({
            grossSales: 34,
            discounts: 4,
            refunds: 2.5,
            tax: 1,
            netSales: 27.5,
        });
    });

    it('nets end-of-day tax proportionally for partially refunded orders', () => {
        expect(
            buildEndOfDayReferenceSummary(
                [
                    { id: 'o-1', total: 22, discountTotal: 0, tax: 2 },
                    { id: 'o-2', total: 11, discountTotal: 0, tax: 1 },
                ] as any,
                [
                    { id: 'r-1', orderId: 'o-1', refundAmount: 11 },
                ] as any,
                [],
                {}
            )
        ).toEqual({
            grossSales: 33,
            discounts: 0,
            refunds: 11,
            tax: 2,
            netSales: 22,
        });
    });

    it('builds refunded line amounts keyed by order line identifier', () => {
        expect(
            buildRefundedLineAmountsForOrder('o-1', [
                {
                    orderId: 'o-1',
                    orderLineIdentifier: 'line-1',
                    lineRefundAmount: 2.5,
                },
                {
                    orderId: 'o-1',
                    orderLineIdentifier: 'line-1',
                    lineRefundAmount: 1.5,
                },
                {
                    orderId: 'o-1',
                    orderLineIdentifier: 'line-2',
                    lineRefundAmount: 4,
                },
                {
                    orderId: 'other',
                    orderLineIdentifier: 'line-1',
                    lineRefundAmount: 99,
                },
            ] as any)
        ).toEqual({
            'line-1': 4,
            'line-2': 4,
        });
    });

    it('filters orders and returns refund-aware references', () => {
        const result = filterOrders(
            [
                {
                    id: 'o-1',
                    total: 25,
                    discountTotal: 4,
                    createdBy: { id: 'emp-1' },
                    employeeId: 'emp-1',
                    paymentInfo: {
                        employeeId: 'closer-1',
                        payments: [{ type: 'CC', amount: 25 }],
                    },
                    lines: [{ productId: 'p-1' }],
                },
            ] as any,
            { openedBy: 'emp-1', productId: 'p-1' },
            [{ id: 'r-1', orderId: 'o-1', refundAmount: 6 }] as any,
            [{ refundId: 'r-1', orderId: 'o-1', productId: 'p-1', lineRefundAmount: 2 }] as any
        );

        expect(result.orders).toHaveLength(1);
        expect(result.summary.CC).toBe(23);
        expect(result.references).toEqual({
            grossSales: 29,
            discounts: 4,
            refunds: 2,
            tax: 0,
            netSales: 23,
        });
        expect(result.totalAmount).toBe(23);
    });

    it('nets refunds out of the payment-method row', () => {
        const result = filterOrders(
            [
                {
                    id: 'o-1',
                    total: 100,
                    paymentInfo: {
                        employeeId: 'closer-1',
                        payments: [
                            { type: 'CC', amount: 60 },
                            { type: 'EBT', amount: 40 },
                        ],
                    },
                    lines: [{ productId: 'p-1' }],
                },
            ] as any,
            {},
            [{ id: 'r-1', orderId: 'o-1', refundAmount: 25 }] as any,
            []
        );

        expect(result.summary).toEqual({
            CC: 45,
            CASH: 0,
            CHECK: 0,
            EBT: 30,
        });
        expect(result.references.netSales).toBe(75);
    });

    it('uses line tender economics so refunded EBT items reduce EBT before card', () => {
        const result = filterOrders(
            [
                {
                    id: 'o-1',
                    total: 100,
                    paymentInfo: {
                        employeeId: 'closer-1',
                        payments: [
                            { type: 'CC', amount: 60 },
                            { type: 'EBT', amount: 40 },
                        ],
                    },
                    lines: [
                        {
                            identifier: 'line-ebt',
                            productId: 'p-1',
                            quantity: 2,
                            lineTotalBeforeTax: 40,
                            ebtPaidAmount: 40,
                            nonEbtPaidAmount: 0,
                        },
                        {
                            identifier: 'line-cc',
                            productId: 'p-2',
                            quantity: 1,
                            lineTotalBeforeTax: 60,
                            ebtPaidAmount: 0,
                            nonEbtPaidAmount: 60,
                        },
                    ],
                },
            ] as any,
            {},
            [{ id: 'r-1', orderId: 'o-1', refundAmount: 20 }] as any,
            [
                {
                    refundId: 'r-1',
                    orderId: 'o-1',
                    orderLineIdentifier: 'line-ebt',
                    productId: 'p-1',
                    quantityRefunded: 1,
                    lineRefundAmount: 20,
                },
            ] as any
        );

        expect(result.summary).toEqual({
            CC: 60,
            CASH: 0,
            CHECK: 0,
            EBT: 20,
        });
        expect(result.references.netSales).toBe(80);
    });

    it('renders date controls and handles date-picker callbacks', async () => {
        const { getByTestId, getByText } = render(<EndOfDay />);

        expect(getByText('Date')).toBeTruthy();

        fireEvent.press(getByTestId('mock-ui-date-picker-cancel'));
        fireEvent.press(getByTestId('mock-ui-date-picker-confirm'));

        await waitFor(() => {
            expect(getByText('Date')).toBeTruthy();
        });
    });
});
