import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { OrderJournalList } from './order-journal-list';

const mockReadPendingOrderJournal = jest.fn();
const mockMarkPendingOrderJournalEntry = jest.fn();
const mockRetryPendingOrderJournalEntrySync = jest.fn();
const mockDispatch = jest.fn();

jest.mock('@pos/orders/data-access', () => ({
    readPendingOrderJournal: (...args: unknown[]) =>
        mockReadPendingOrderJournal(...args),
    markPendingOrderJournalEntry: (...args: unknown[]) =>
        mockMarkPendingOrderJournalEntry(...args),
    retryPendingOrderJournalEntrySync: (...args: unknown[]) =>
        mockRetryPendingOrderJournalEntrySync(...args),
    ordersActions: {
        hydratePendingOrders: (payload: unknown) => ({
            type: 'orders/hydratePendingOrders',
            payload,
        }),
    },
}));

jest.mock('@pos/store', () => ({
    useAppDispatch: () => mockDispatch,
}));

jest.mock('react-redux', () => ({
    useSelector: (selector: (state: any) => unknown) =>
        selector({
            employee: {
                id: 'employee-1',
                firstName: 'Alex',
                lastName: 'Cashier',
            },
        }),
}));

jest.mock('@pos/employees/data-access', () => ({
    selectLoginEmployee: (state: any) => state.employee,
}));

jest.mock('@pos/theme/native/design-tokens', () => ({
    useDesignTokens: () => ({
        colors: {
            accent: '#4aa3eb',
            border: '#d0d7de',
            surface: '#ffffff',
            surfaceMuted: '#f3f4f6',
            textPrimary: '#111827',
            textSecondary: '#374151',
            textMuted: '#6b7280',
            success: '#16a34a',
            danger: '#dc2626',
        },
        spacing: {
            xs: 4,
            sm: 8,
            md: 12,
            xl: 24,
        },
        radii: {
            md: 12,
        },
    }),
}));

jest.mock('@pos/shared/ui-native', () => ({
    UICard: ({ children }: { children: React.ReactNode }) => children,
    UIEmptyState: ({ text }: { text: string }) => {
        const { Text } = require('react-native');
        return <Text>{text}</Text>;
    },
    UISearchInput: ({ value, onChangeText }: any) => {
        const { TextInput } = require('react-native');
        return <TextInput value={value} onChangeText={onChangeText} />;
    },
}));

describe('OrderJournalList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('loads and renders tenant-scoped journal entries', async () => {
        mockReadPendingOrderJournal.mockResolvedValue([
            {
                orderId: 'order-1',
                orderNo: '1001',
                tenantId: 'tenant-1',
                statusTarget: 'PAID',
                cart: {
                    id: 'order-1',
                    items: [{ identifier: 'line-1', quantity: 1, product: { name: 'Apple' } }],
                    footer: { total: 12.5 },
                    definitions: [],
                    manualDiscounts: [],
                    priceOverrides: [],
                    promoCodes: [],
                    approvalEvents: [],
                },
                createdAt: '2026-04-01T12:00:00.000Z',
                updatedAt: '2026-04-01T12:00:00.000Z',
                syncState: 'synced',
                employee: { name: 'Alex Cashier' },
            },
        ]);

        const { getByText, getByTestId } = render(
            <OrderJournalList tenantId="tenant-1" onClose={jest.fn()} />
        );

        await waitFor(() => {
            expect(mockReadPendingOrderJournal).toHaveBeenCalledWith({
                tenantId: 'tenant-1',
                limit: 500,
            });
        });

        expect(getByText('Order Journal')).toBeTruthy();
        expect(
            getByTestId('order-journal-list-flat-list').props
                .keyboardShouldPersistTaps
        ).toBe('handled');
        expect(getByText('1001')).toBeTruthy();
        expect(getByText('Alex Cashier')).toBeTruthy();
        expect(getByText('$ 12.50')).toBeTruthy();
    });

    it('shows retry for unsynced entries and triggers a manual retry', async () => {
        mockReadPendingOrderJournal.mockResolvedValue([
            {
                orderId: 'order-1',
                orderNo: '1001',
                tenantId: 'tenant-1',
                statusTarget: 'PAID',
                cart: {
                    id: 'order-1',
                    items: [],
                    footer: { total: 12.5 },
                    definitions: [],
                    manualDiscounts: [],
                    priceOverrides: [],
                    promoCodes: [],
                    approvalEvents: [],
                },
                payments: [{ type: 'cash', amount: 12.5 }],
                createdAt: '2026-04-01T12:00:00.000Z',
                updatedAt: '2026-04-01T12:00:00.000Z',
                syncState: 'sync_failed',
                employee: { name: 'Alex Cashier' },
            },
        ]);
        mockMarkPendingOrderJournalEntry.mockResolvedValue([
            {
                orderId: 'order-1',
                orderNo: '1001',
                tenantId: 'tenant-1',
                statusTarget: 'PAID',
                cart: {
                    id: 'order-1',
                    items: [],
                    footer: { total: 12.5 },
                    definitions: [],
                    manualDiscounts: [],
                    priceOverrides: [],
                    promoCodes: [],
                    approvalEvents: [],
                },
                payments: [{ type: 'cash', amount: 12.5 }],
                createdAt: '2026-04-01T12:00:00.000Z',
                updatedAt: '2026-04-01T12:00:00.000Z',
                syncState: 'sync_pending',
                employee: { name: 'Alex Cashier' },
            },
        ]);
        mockRetryPendingOrderJournalEntrySync.mockResolvedValue(undefined);

        const { getByTestId } = render(
            <OrderJournalList tenantId="tenant-1" onClose={jest.fn()} />
        );

        await waitFor(() => {
            expect(getByTestId('order-journal-retry-order-1')).toBeTruthy();
        });

        fireEvent.press(getByTestId('order-journal-retry-order-1'));

        await waitFor(() => {
            expect(mockMarkPendingOrderJournalEntry).toHaveBeenCalledWith(
                'order-1',
                expect.objectContaining({
                    syncState: 'sync_pending',
                    lastError: undefined,
                }),
                { tenantId: 'tenant-1' }
            );
        });
        expect(mockRetryPendingOrderJournalEntrySync).toHaveBeenCalledWith(
            expect.objectContaining({ orderId: 'order-1' }),
            {
                id: 'employee-1',
                firstName: 'Alex',
                lastName: 'Cashier',
            }
        );
    });

    it('does not show retry for sync_pending entries', async () => {
        mockReadPendingOrderJournal.mockResolvedValue([
            {
                orderId: 'order-2',
                orderNo: '1002',
                tenantId: 'tenant-1',
                statusTarget: 'OPEN',
                cart: {
                    id: 'order-2',
                    items: [],
                    footer: { total: 15.99 },
                    definitions: [],
                    manualDiscounts: [],
                    priceOverrides: [],
                    promoCodes: [],
                    approvalEvents: [],
                },
                createdAt: '2026-04-02T02:22:26.000Z',
                updatedAt: '2026-04-02T02:22:26.000Z',
                syncState: 'sync_pending',
                employee: { name: 'TEST TEST' },
            },
        ]);

        const { queryByTestId, getByText } = render(
            <OrderJournalList tenantId="tenant-1" onClose={jest.fn()} />
        );

        await waitFor(() => {
            expect(getByText('Sync pending')).toBeTruthy();
        });

        expect(queryByTestId('order-journal-retry-order-2')).toBeNull();
    });
});
