
/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

const mockDispatch = jest.fn();
const mockSearch = jest.fn();
const mockSubscribeUnsubscribe = jest.fn();
const mockSearchInputValue = { current: '' };
const mockDialogProps = { overlayStyle: undefined as unknown };
const mockOpenOrderPaymentDialog = jest.fn(() => null);

let mockOrders = [
    {
        id: 'open-1',
        orderNo: '51-OPEN-0001',
        subtotal: 20,
        tax: 0,
        total: 20,
        status: 'OPEN',
        employeeId: 'emp-1',
        employeeName: 'Cashier',
        orderDate: '2026-03-12T12:00:00.000Z',
        lines: [],
    },
    {
        id: 'paid-1',
        orderNo: '51-PAID-0001',
        subtotal: 35,
        tax: 0,
        total: 35,
        status: 'PAID',
        employeeId: 'emp-2',
        employeeName: 'Cashier',
        orderDate: '2026-03-12T13:00:00.000Z',
        lines: [],
    },
];

const mockI18next = {
    isInitialized: false,
    exists: jest.fn(() => false),
    t: jest.fn((key: string) => key),
};

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: () => unknown) => selector(),
}));

jest.mock('@pos/theme/native/design-tokens', () => ({
    useDesignTokens: () => ({
        spacing: { sm: 8, md: 12, lg: 16 },
        radii: { md: 10 },
        colors: {
            border: '#2f374288',
            canvas: '#000000',
            surfaceMuted: '#2f37422a',
            accent: '#4aa3eb',
            textMuted: '#8491a2',
            textPrimary: '#f7f9fc',
        },
    }),
}));

jest.mock('i18next', () => mockI18next);

jest.mock('@pos/shared/ui-native', () => ({
    UIScreen: ({
        children,
        testID,
    }: {
        children: React.ReactNode;
        testID?: string;
    }) => {
        const { View } = require('react-native');
        return <View testID={testID}>{children}</View>;
    },
    UIStack: ({ children }: { children: React.ReactNode }) => {
        const { View } = require('react-native');
        return <View>{children}</View>;
    },
    UICard: ({
        children,
        testID,
    }: {
        children: React.ReactNode;
        testID?: string;
    }) => {
        const { View } = require('react-native');
        return <View testID={testID}>{children}</View>;
    },
    UISearchInput: require('react').forwardRef(
        (
            {
                onSubmit,
                editable = true,
            }: {
                onSubmit: (value: string) => void;
                editable?: boolean;
            },
            ref: React.Ref<{ focus: () => void; clear: () => void }>
        ) => {
            require('react').useImperativeHandle(ref, () => ({
                focus: jest.fn(),
                clear: jest.fn(),
            }));
            const { Pressable, Text } = require('react-native');
            return (
                <Pressable
                    testID="order-list-search-input"
                    accessibilityState={{ disabled: !editable }}
                    onPress={() => onSubmit(mockSearchInputValue.current)}
                    disabled={!editable}
                >
                    <Text>Search</Text>
                </Pressable>
            );
        }
    ),
    UIEmptyState: ({
        text,
        title,
        subtitle,
    }: {
        text?: string;
        title?: string;
        subtitle?: string;
    }) => {
        const { Text } = require('react-native');
        return (
            <>
                {title ? <Text>{title}</Text> : null}
                {subtitle ? <Text>{subtitle}</Text> : null}
                {text ? <Text>{text}</Text> : null}
            </>
        );
    },
}));

jest.mock('@rneui/themed', () => ({
    ButtonGroup: ({
        buttons,
        onPress,
    }: {
        buttons: string[];
        onPress: (index: number) => void;
    }) => {
        const { View, Pressable, Text } = require('react-native');
        return (
            <View>
                {buttons.map((button, index) => (
                    <Pressable
                        key={button}
                        testID={`status-${button}`}
                        onPress={() => onPress(index)}
                    >
                        <Text>{button}</Text>
                    </Pressable>
                ))}
            </View>
        );
    },
    Dialog: ({
        children,
        isVisible,
        overlayStyle,
    }: {
        children: React.ReactNode;
        isVisible: boolean;
        overlayStyle?: unknown;
    }) => {
        const { View } = require('react-native');
        mockDialogProps.overlayStyle = overlayStyle;
        return isVisible ? <View testID="order-void-dialog">{children}</View> : null;
    },
}));

jest.mock('@react-navigation/native', () => ({
    useFocusEffect: (callback: () => (() => void) | void) => {
        callback();
    },
}));

jest.mock('@pos/shared/data-store', () => ({
    eventsActions: {
        add: (payload: unknown) => ({ type: 'events/add', payload }),
    },
}));

jest.mock('@pos/shared/utils', () => ({
    logSyncDebug: jest.fn(),
}));

jest.mock('react-native-uuid', () => ({
    v4: () => 'uuid-1',
}));

jest.mock('@pos/shared/api', () => ({
    OrderStatus: {
        OPEN: 'OPEN',
        PAID: 'PAID',
        PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
        REFUNDED: 'REFUNDED',
    },
}));

jest.mock('@pos/orders/data-access', () => ({
    selectAllOrders: () => mockOrders,
    syncOrders: jest.fn(),
    subscribeToOrderChanges: () => ({
        unsubscribe: mockSubscribeUnsubscribe,
    }),
    subscribeToOrderRefundChanges: () => ({
        unsubscribe: mockSubscribeUnsubscribe,
    }),
    subscribeToOrderRefundLineChanges: () => ({
        unsubscribe: mockSubscribeUnsubscribe,
    }),
    OrderService: {
        search: (orders: typeof mockOrders, options: { status: string; filter?: string }) =>
            mockSearch(orders, options),
    },
}));

jest.mock('../order-item/order-item', () => ({
    __esModule: true,
    default: ({
        item,
        onVoid,
        onPay,
    }: {
        item: { id: string; orderNo: string };
        onVoid: (order: { id: string }) => void;
        onPay: (order: { id: string }) => void;
    }) => {
        const { View, Text, Pressable } = require('react-native');
        return (
            <View>
                <Text>{item.orderNo}</Text>
                <Pressable testID={`order-void-${item.id}`} onPress={() => onVoid(item)}>
                    <Text>Void</Text>
                </Pressable>
                <Pressable testID={`order-pay-${item.id}`} onPress={() => onPay(item)}>
                    <Text>Pay</Text>
                </Pressable>
            </View>
        );
    },
}));

jest.mock('../order-void-form/order-void-form', () => ({
    __esModule: true,
    default: () => {
        const { Text } = require('react-native');
        return <Text>Void Form</Text>;
    },
}));

jest.mock('../open-order-payment-dialog/open-order-payment-dialog', () => ({
    __esModule: true,
    default: (props: unknown) => mockOpenOrderPaymentDialog(props),
}));

const { OrderList } = require('./order-list');

describe('OrderList integration', () => {
    beforeAll(() => {
        jest.useFakeTimers();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockDialogProps.overlayStyle = undefined;
        mockOpenOrderPaymentDialog.mockReturnValue(null);
        mockI18next.isInitialized = false;
        mockI18next.exists.mockImplementation(() => false);
        mockI18next.t.mockImplementation((key: string) => key);
        mockSearchInputValue.current = '';
        mockOrders = [
            {
                id: 'open-1',
                orderNo: '51-OPEN-0001',
                subtotal: 20,
                tax: 0,
                total: 20,
                status: 'OPEN',
                employeeId: 'emp-1',
                employeeName: 'Cashier',
                orderDate: '2026-03-12T12:00:00.000Z',
                lines: [],
            },
            {
                id: 'paid-1',
                orderNo: '51-PAID-0001',
                subtotal: 35,
                tax: 0,
                total: 35,
                status: 'PAID',
                employeeId: 'emp-2',
                employeeName: 'Cashier',
                orderDate: '2026-03-12T13:00:00.000Z',
                lines: [],
            },
        ];
        mockSearch.mockImplementation(
            (orders: typeof mockOrders, options: { status: string; filter?: string }) =>
                orders.filter((order) => {
                    const statusMatch = order.status === options.status;
                    const filter = options.filter?.trim().toLowerCase();
                    if (!filter) return statusMatch;
                    return statusMatch && order.orderNo.toLowerCase().includes(filter);
                })
        );
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('renders the migrated primitives layout and OPEN orders by default', () => {
        const { getByTestId, getByText } = render(<OrderList />);
        act(() => {
            jest.runOnlyPendingTimers();
        });

        expect(getByTestId('order-list-filters-card')).toBeTruthy();
        expect(getByTestId('order-list-results-card')).toBeTruthy();
        expect(
            getByTestId('order-list-flat-list').props.keyboardShouldPersistTaps
        ).toBe('handled');
        expect(getByText('51-OPEN-0001')).toBeTruthy();
    });

    it('falls back to a non-empty partial refund tab label when the translation value is blank', () => {
        mockI18next.isInitialized = true;
        mockI18next.exists.mockImplementation(
            (key: string) => key === 'ORDERSTATUS_PartiallyRefunded'
        );
        mockI18next.t.mockImplementation((key: string) =>
            key === 'ORDERSTATUS_PartiallyRefunded' ? '   ' : key
        );

        const { getByTestId, queryByTestId } = render(<OrderList />);
        act(() => {
            jest.runOnlyPendingTimers();
        });

        expect(getByTestId('status-PARTIAL')).toBeTruthy();
        expect(queryByTestId('status-')).toBeNull();
    });

    it('filters list when selecting PAID tab', () => {
        const { getByTestId, queryByText, getByText } = render(<OrderList />);
        act(() => {
            jest.runOnlyPendingTimers();
        });

        fireEvent.press(getByTestId('status-PAID'));
        act(() => {
            jest.runOnlyPendingTimers();
        });

        expect(getByText('51-PAID-0001')).toBeTruthy();
        expect(queryByText('51-OPEN-0001')).toBeNull();
    });

    it('removes a closed order from OPEN and shows it in PAID after the refreshed order set arrives', () => {
        const view = render(<OrderList />);
        act(() => {
            jest.runOnlyPendingTimers();
        });

        expect(view.getByText('51-OPEN-0001')).toBeTruthy();

        mockOrders = [
            {
                id: 'open-1',
                orderNo: '51-OPEN-0001',
                subtotal: 20,
                tax: 0,
                total: 20,
                status: 'PAID',
                employeeId: 'emp-1',
                employeeName: 'Cashier',
                orderDate: '2026-03-12T12:00:00.000Z',
                lines: [],
            },
            {
                id: 'paid-1',
                orderNo: '51-PAID-0001',
                subtotal: 35,
                tax: 0,
                total: 35,
                status: 'PAID',
                employeeId: 'emp-2',
                employeeName: 'Cashier',
                orderDate: '2026-03-12T13:00:00.000Z',
                lines: [],
            },
        ];

        view.rerender(<OrderList />);
        act(() => {
            jest.runOnlyPendingTimers();
        });

        expect(view.queryByText('51-OPEN-0001')).toBeNull();

        fireEvent.press(view.getByTestId('status-PAID'));
        act(() => {
            jest.runOnlyPendingTimers();
        });

        expect(view.getByText('51-OPEN-0001')).toBeTruthy();
        expect(view.getByText('51-PAID-0001')).toBeTruthy();
    });

    it('shows empty state when search has no results', () => {
        const { getByTestId, getByText } = render(<OrderList />);
        act(() => {
            jest.runOnlyPendingTimers();
        });
        mockSearchInputValue.current = 'no-match';

        fireEvent.press(getByTestId('order-list-search-input'));
        act(() => {
            jest.runOnlyPendingTimers();
        });

        expect(getByText('No orders found')).toBeTruthy();
    });

    it('keeps the search input visible but disabled when the selected status has no orders', () => {
        const { getByTestId, getByText } = render(<OrderList />);
        act(() => {
            jest.runOnlyPendingTimers();
        });

        fireEvent.press(getByTestId('status-REFUNDED'));
        act(() => {
            jest.runOnlyPendingTimers();
        });

        expect(getByTestId('order-list-search-input').props.accessibilityState).toEqual({
            disabled: true,
        });
        expect(
            getByText('Orders with the selected status will appear here.')
        ).toBeTruthy();
    });

    it('opens void dialog when an order item requests void action', () => {
        const { getByTestId } = render(<OrderList />);
        act(() => {
            jest.runOnlyPendingTimers();
        });

        fireEvent.press(getByTestId('order-void-open-1'));
        act(() => {
            jest.runOnlyPendingTimers();
        });

        expect(getByTestId('order-void-dialog')).toBeTruthy();
    });

    it('opens the direct payment dialog when an order item requests payment', () => {
        render(<OrderList />);
        act(() => {
            jest.runOnlyPendingTimers();
        });

        const view = render(<OrderList />);
        act(() => {
            jest.runOnlyPendingTimers();
        });

        fireEvent.press(view.getByTestId('order-pay-open-1'));
        act(() => {
            jest.runOnlyPendingTimers();
        });

        expect(mockOpenOrderPaymentDialog).toHaveBeenLastCalledWith(
            expect.objectContaining({
                visible: true,
                order: expect.objectContaining({ id: 'open-1' }),
            })
        );
    });

    it('uses a wider overlay for the redesigned void dialog', () => {
        render(<OrderList />);
        act(() => {
            jest.runOnlyPendingTimers();
        });

        expect(mockDialogProps.overlayStyle).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ width: 1120, maxWidth: '94%' }),
            ])
        );
    });
});
