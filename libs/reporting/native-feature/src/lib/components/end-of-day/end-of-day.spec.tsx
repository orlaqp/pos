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
    buildEndOfDayWidgets,
    buildEndOfDayFilterConfigs,
    buildDayRange,
    createDateUpdater,
    formatPaymentAmount,
    getPaymentMethodsTotal,
    loadPaidSalesForRange,
} from './end-of-day';

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
        const total = getPaymentMethodsTotal({ CC: 12.5, CASH: 3, CHECK: 4.25 });
        expect(total).toBe(19.75);
        expect(formatPaymentAmount(total)).toBe('$19.75');
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
        expect(fetchSales).toHaveBeenCalledWith('PAID', expect.anything());
    });

    it('builds widget definitions for summary cards', () => {
        const widgets = buildEndOfDayWidgets(
            3,
            { CC: 10, CASH: 5, CHECK: 2 },
            '#111'
        );

        expect(widgets).toEqual([
            { text: 'Sales', value: '3', backgroundColor: '#111', flex: 0.7 },
            { text: 'Total', value: '$17', backgroundColor: '#111', flex: 1 },
            { text: 'Credit Card', value: '$10', backgroundColor: '#1976d2', flex: 1 },
            { text: 'Cash', value: '$5', backgroundColor: '#e91e63', flex: 1 },
            { text: 'Checks', value: '$2', backgroundColor: '#43a047', flex: 1 },
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
        const loadForRange = jest.fn().mockResolvedValue([{ id: 'o-2' }]);

        const updateDate = createDateUpdater(
            setDate as any,
            setLoading as any,
            setOrders as any,
            setFilteredOrders as any,
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
