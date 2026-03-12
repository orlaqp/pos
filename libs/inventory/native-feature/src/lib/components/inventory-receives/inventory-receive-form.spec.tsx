/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

const mockDispatch = jest.fn();
const mockGoBack = jest.fn();
const mockConfirm = jest.fn((_: string, __: string, onConfirm: () => void) => onConfirm());
const mockInventoryReceiveSave = jest.fn(() => Promise.resolve());
const mockProducts: unknown[] = [];
const mockState = {
    inventoryReceive: {
        selected: null,
    },
};

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: (state: unknown) => unknown) => selector(mockState),
}));

jest.mock('@pos/theme/native', () => ({
    useSharedStyles: () => ({
        page: {},
        secondaryText: {},
        primaryText: {},
        textCenter: {},
        textBold: {},
        darkBackground: {},
    }),
}));

jest.mock('@pos/shared/ui-native', () => ({
    UIActions: ({ submitAction, cancelAction }: { submitAction: () => void; cancelAction: () => void }) => (
        <View>
            <Pressable testID="inventory-receive-save-button" onPress={submitAction}>
                <Text>Save</Text>
            </Pressable>
            <Pressable testID="inventory-receive-cancel-button" onPress={cancelAction}>
                <Text>Cancel</Text>
            </Pressable>
        </View>
    ),
    UISearchInput: React.forwardRef(() => <View testID="inventory-receive-search" />),
}));

jest.mock('@rneui/themed', () => ({
    useTheme: () => ({
        theme: {
            colors: {
                warning: '#f90',
                primary: '#00f',
                grey5: '#ccc',
                grey0: '#fff',
            },
        },
    }),
    Button: ({ title, onPress, testID }: { title?: string; onPress: () => void; testID?: string }) => (
        <Pressable testID={testID || title} onPress={onPress}>
            <Text>{title || 'button'}</Text>
        </Pressable>
    ),
}));

jest.mock('@pos/shared/utils', () => ({
    confirm: (title: string, message: string, onConfirm: () => void) =>
        mockConfirm(title, message, onConfirm),
}));

jest.mock('@pos/products/data-access', () => ({
    fetchProducts: jest.fn(() => ({ type: 'products/fetchStatus/pending' })),
    ProductService: {
        search: jest.fn(() => ({ items: [], allNumbers: false })),
    },
    selectAllProducts: () => mockProducts,
    subscribeToProductChanges: () => ({ unsubscribe: jest.fn() }),
}));

jest.mock('@pos/employees/data-access', () => ({
    selectLoginEmployee: () => ({
        id: 'emp-1',
        firstName: 'Test',
        lastName: 'User',
    }),
}));

jest.mock('../inventory-receives/inventory-receive-line', () => ({
    __esModule: true,
    default: () => <View testID="inventory-receive-line" />,
}));

jest.mock('../shared/compact-product-list/compact-product-list', () => ({
    __esModule: true,
    default: () => <View testID="compact-product-list" />,
}));

jest.mock('@pos/inventory/data-access', () => ({
    inventoryReceiveActions: {
        clearSelection: () => ({ type: 'inventoryReceive/clearSelection' }),
    },
    InventoryReceiveMapper: {
        newReceive: () => ({
            status: 'IN_PROGRESS',
            comments: 'n/a',
            lines: [],
            createdBy: { id: 'emp-1', name: 'Test User' },
        }),
    },
    InventoryReceiveService: {
        save: (...args: unknown[]) => mockInventoryReceiveSave(...args),
    },
}));

const { InventoryReceiveForm } = require('./inventory-receive-form');

describe('InventoryReceiveForm integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const route = { params: {} };
    const navigation = { goBack: mockGoBack };

    it('saves receive draft with updateInv=false from UIActions submit', async () => {
        const { getByTestId } = render(
            <InventoryReceiveForm route={route} navigation={navigation} />
        );

        fireEvent.press(getByTestId('inventory-receive-save-button'));

        await waitFor(() => {
            expect(mockInventoryReceiveSave).toHaveBeenCalledWith(
                mockDispatch,
                expect.objectContaining({ status: 'IN_PROGRESS', lines: [] }),
                false
            );
            expect(mockGoBack).toHaveBeenCalled();
        });
    });

    it('updates inventory with updateInv=true after confirm', async () => {
        const { getByTestId } = render(
            <InventoryReceiveForm route={route} navigation={navigation} />
        );

        fireEvent.press(getByTestId('inventory-receive-update-inventory-button'));

        await waitFor(() => {
            expect(mockConfirm).toHaveBeenCalled();
            expect(mockInventoryReceiveSave).toHaveBeenCalledWith(
                mockDispatch,
                expect.objectContaining({ status: 'COMPLETED', lines: [] }),
                true
            );
        });
    });
});
