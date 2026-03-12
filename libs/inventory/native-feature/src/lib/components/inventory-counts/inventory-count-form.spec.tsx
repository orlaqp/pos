/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

const mockDispatch = jest.fn();
const mockGoBack = jest.fn();
const mockConfirm = jest.fn((_: string, __: string, onConfirm: () => void) => onConfirm());
const mockInventoryCountSave = jest.fn(() => Promise.resolve());
const mockUpdateQuantities = jest.fn((lines: unknown[]) => ({ type: 'products/updateQuantities', payload: lines }));
const mockProducts = [
    {
        id: 'p-1',
        name: 'Apple',
        isActive: true,
        trackStock: true,
        barcode: '111',
        sku: 'A1',
        plu: '11',
        unitOfMeasure: 'EA',
        description: 'Red',
        quantity: 10,
    },
    {
        id: 'p-2',
        name: 'Banana',
        isActive: true,
        trackStock: true,
        barcode: '222',
        sku: 'B1',
        plu: '22',
        unitOfMeasure: 'EA',
        description: 'Yellow',
        quantity: 20,
    },
];

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: () => unknown) => selector(),
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
            <Pressable testID="inventory-count-save-button" onPress={submitAction}>
                <Text>Save</Text>
            </Pressable>
            <Pressable testID="inventory-count-cancel-button" onPress={cancelAction}>
                <Text>Cancel</Text>
            </Pressable>
        </View>
    ),
    UISearchInput: React.forwardRef(() => <View testID="inventory-count-search" />),
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
    ProductService: {
        search: jest.fn(() => ({ items: [], allNumbers: false })),
    },
    productsActions: {
        updateQuantities: (lines: unknown[]) => mockUpdateQuantities(lines),
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

jest.mock('../inventory-counts/inventory-count-line', () => ({
    __esModule: true,
    default: () => <View testID="inventory-count-line" />,
}));

jest.mock('../shared/compact-product-list/compact-product-list', () => ({
    __esModule: true,
    default: () => <View testID="compact-product-list" />,
}));

jest.mock('@pos/inventory/data-access', () => ({
    inventoryCountActions: {
        clearSelection: () => ({ type: 'inventoryCount/clearSelection' }),
    },
    InventoryCountLineMapper: {
        fromProduct: (product: { id: string; name: string; unitOfMeasure: string; quantity: number }) => ({
            productId: product.id,
            productName: product.name,
            unitOfMeasure: product.unitOfMeasure,
            current: product.quantity,
            newCount: undefined,
            comments: '',
            inventoryCountLineInventoryCountId: '',
        }),
    },
    InventoryCountMapper: {
        newCount: () => ({
            status: 'IN_PROGRESS',
            comments: 'n/a',
            lines: [],
            createdBy: { id: 'emp-1', name: 'Test User' },
        }),
    },
    InventoryCountService: {
        save: (...args: unknown[]) => mockInventoryCountSave(...args),
    },
    selectInventoryCountSelected: () => null,
}));

const { InventoryCountForm } = require('./inventory-count-form');

describe('InventoryCountForm integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const route = { params: {} };
    const navigation = { goBack: mockGoBack };

    it('toggles from quick mode to full mode and shows full count progress', async () => {
        const { getByTestId, getByText } = render(
            <InventoryCountForm route={route} navigation={navigation} />
        );

        expect(getByText('Quick: search/scan and add only what you count.')).toBeTruthy();

        fireEvent.press(getByTestId('inventory-count-mode-full'));

        await waitFor(() => {
            expect(
                getByText('Full: preload all active stock-tracked products.')
            ).toBeTruthy();
            expect(getByText('Count Progress: 0 / 2')).toBeTruthy();
        });
    });

    it('saves draft count with updateInv=false from UIActions submit', async () => {
        const { getByTestId } = render(
            <InventoryCountForm route={route} navigation={navigation} />
        );

        fireEvent.press(getByTestId('inventory-count-save-button'));

        await waitFor(() => {
            expect(mockInventoryCountSave).toHaveBeenCalledWith(
                mockDispatch,
                expect.objectContaining({ status: 'IN_PROGRESS', lines: [] }),
                false
            );
            expect(mockGoBack).toHaveBeenCalled();
        });
    });

    it('updates inventory with updateInv=true and dispatches product quantity update', async () => {
        const { getByTestId } = render(
            <InventoryCountForm route={route} navigation={navigation} />
        );

        fireEvent.press(getByTestId('inventory-count-update-inventory-button'));

        await waitFor(() => {
            expect(mockConfirm).toHaveBeenCalled();
            expect(mockInventoryCountSave).toHaveBeenCalledWith(
                mockDispatch,
                expect.objectContaining({ status: 'COMPLETED', lines: [] }),
                true
            );
            expect(mockUpdateQuantities).toHaveBeenCalledWith([]);
        });
    });
});
