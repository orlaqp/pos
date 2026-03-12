
/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

const mockDispatch = jest.fn();
const mockSearch = jest.fn();
const mockSubscribeUnsubscribe = jest.fn();
const mockSearchInputValue = { current: '' };

const mockOrders = [
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

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: () => unknown) => selector(),
}));

jest.mock('@pos/theme/native/design-tokens', () => ({
    useDesignTokens: () => ({
        spacing: { sm: 8, md: 12, lg: 16 },
        colors: {
            border: '#2f374288',
            canvas: '#000000',
        },
    }),
}));

jest.mock('@pos/shared/ui-native', () => ({
    UIScreen: ({
        children,
        testID,
    }: {
        children: React.ReactNode;
        testID?: string;
    }) => <View testID={testID}>{children}</View>,
    UIStack: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    UICard: ({
        children,
        testID,
    }: {
        children: React.ReactNode;
        testID?: string;
    }) => <View testID={testID}>{children}</View>,
    UISearchInput: React.forwardRef(
        (
            { onSubmit }: { onSubmit: (value: string) => void },
            ref: React.Ref<{ focus: () => void; clear: () => void }>
        ) => {
            React.useImperativeHandle(ref, () => ({
                focus: jest.fn(),
                clear: jest.fn(),
            }));
            return (
                <Pressable
                    testID="order-list-search-input"
                    onPress={() => onSubmit(mockSearchInputValue.current)}
                >
                    <Text>Search</Text>
                </Pressable>
            );
        }
    ),
    UIEmptyState: ({ text }: { text: string }) => <Text>{text}</Text>,
}));

jest.mock('@rneui/themed', () => ({
    ButtonGroup: ({
        buttons,
        onPress,
    }: {
        buttons: string[];
        onPress: (index: number) => void;
    }) => (
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
    ),
    Dialog: ({
        children,
        isVisible,
    }: {
        children: React.ReactNode;
        isVisible: boolean;
    }) => (isVisible ? <View testID="order-void-dialog">{children}</View> : null),
}));

jest.mock('@pos/shared/data-store', () => ({
    eventsActions: {
        add: (payload: unknown) => ({ type: 'events/add', payload }),
    },
}));

jest.mock('react-native-uuid', () => ({
    v4: () => 'uuid-1',
}));

jest.mock('@pos/shared/api', () => ({
    OrderStatus: {
        OPEN: 'OPEN',
        PAID: 'PAID',
        REFUNDED: 'REFUNDED',
    },
}));

jest.mock('@pos/orders/data-access', () => ({
    selectAllOrders: () => mockOrders,
    subscribeToOrderChanges: () => ({
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
    }: {
        item: { id: string; orderNo: string };
        onVoid: (order: { id: string }) => void;
    }) => (
        <View>
            <Text>{item.orderNo}</Text>
            <Pressable testID={`order-void-${item.id}`} onPress={() => onVoid(item)}>
                <Text>Void</Text>
            </Pressable>
        </View>
    ),
}));

jest.mock('../order-void-form/order-void-form', () => ({
    __esModule: true,
    default: () => <Text>Void Form</Text>,
}));

const { OrderList } = require('./order-list');

describe('OrderList integration', () => {
    beforeAll(() => {
        jest.useFakeTimers();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockSearchInputValue.current = '';
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
        expect(getByText('51-OPEN-0001')).toBeTruthy();
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
});
