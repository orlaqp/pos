/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert, Pressable, Text, View } from 'react-native';

const mockDispatch = jest.fn();
const mockGoBack = jest.fn();
const mockConfirm = jest.fn((_: string, __: string, onConfirm: () => void) => onConfirm());
const mockInventoryCountSave = jest.fn(() => Promise.resolve());
const mockUpdateQuantities = jest.fn((lines: unknown[]) => ({ type: 'products/updateQuantities', payload: lines }));
const mockProductSearch = jest.fn(() => ({ items: [], allNumbers: false }));
let mockSelectedInventoryCount: any = null;
let mockEmployee: any = {
    id: 'emp-1',
    firstName: 'Test',
    lastName: 'User',
};
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
    UISearchInput: React.forwardRef(
        (
            {
                onSubmit,
                onClear,
            }: {
                onSubmit: (text: string) => void;
                onClear: () => void;
            },
            _
        ) => (
            <View testID="inventory-count-search">
                <Pressable
                    testID="inventory-count-search-submit"
                    onPress={() => onSubmit('111')}
                >
                    <Text>Submit Search</Text>
                </Pressable>
                <Pressable testID="inventory-count-search-clear" onPress={onClear}>
                    <Text>Clear Search</Text>
                </Pressable>
            </View>
        )
    ),
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
        search: (...args: unknown[]) => mockProductSearch(...args),
    },
    productsActions: {
        updateQuantities: (lines: unknown[]) => mockUpdateQuantities(lines),
    },
    selectAllProducts: () => mockProducts,
    subscribeToProductChanges: () => ({ unsubscribe: jest.fn() }),
}));

jest.mock('@pos/employees/data-access', () => ({
    selectLoginEmployee: () => mockEmployee,
}));

jest.mock('../inventory-counts/inventory-count-line', () => ({
    __esModule: true,
    default: ({
        item,
        onUpdate,
        onDelete,
    }: {
        item: any;
        onUpdate: (item: any) => void;
        onDelete: (item: any) => void;
    }) => (
        <View testID="inventory-count-line">
            <Pressable
                testID={`inventory-count-line-update-${item.productId}`}
                onPress={() =>
                    onUpdate({
                        ...item,
                        newCount: 33,
                        comments: 'updated',
                    })
                }
            >
                <Text>Update Line</Text>
            </Pressable>
            <Pressable
                testID={`inventory-count-line-delete-${item.productId}`}
                onPress={() => onDelete(item)}
            >
                <Text>Delete Line</Text>
            </Pressable>
        </View>
    ),
}));

jest.mock('../shared/compact-product-list/compact-product-list', () => ({
    __esModule: true,
    default: ({
        visible,
        onAdd,
        onClose,
    }: {
        visible: boolean;
        onAdd: (product: any) => void;
        onClose: () => void;
    }) => (
        <View testID="compact-product-list">
            <Text>{visible ? 'visible' : 'hidden'}</Text>
            <Pressable
                testID="compact-product-list-add"
                onPress={() => onAdd(mockProducts[0])}
            >
                <Text>Add Product</Text>
            </Pressable>
            <Pressable testID="compact-product-list-close" onPress={onClose}>
                <Text>Close Product List</Text>
            </Pressable>
        </View>
    ),
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
    selectInventoryCountSelected: () => mockSelectedInventoryCount,
}));

const {
    InventoryCountForm,
    appendCountLineIfMissing,
    applyCountLineUpdate,
    asFullCountLines,
    normalizeCode,
    isExactCodeMatch,
} = require('./inventory-count-form');

describe('InventoryCountForm integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSelectedInventoryCount = null;
        mockEmployee = { id: 'emp-1', firstName: 'Test', lastName: 'User' };
        mockProductSearch.mockReturnValue({ items: [], allNumbers: false });
        jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
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

        fireEvent.press(getByTestId('inventory-count-mode-reload'));
        await waitFor(() => {
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

    it('blocks save when at least one line is missing new count', async () => {
        mockSelectedInventoryCount = {
            id: 'count-1',
            status: 'IN_PROGRESS',
            comments: 'test',
            lines: [
                {
                    productId: 'p-1',
                    productName: 'Apple',
                    unitOfMeasure: 'EA',
                    current: 10,
                    newCount: undefined,
                    comments: '',
                },
            ],
        };

        const { getByTestId } = render(
            <InventoryCountForm route={route} navigation={navigation} />
        );

        fireEvent.press(getByTestId('inventory-count-save-button'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Make sure all products have a new count value'
            );
            expect(mockInventoryCountSave).not.toHaveBeenCalled();
        });
    });

    it('alerts when no employee is available on new count save', async () => {
        mockEmployee = null;

        const { getByTestId } = render(
            <InventoryCountForm route={route} navigation={navigation} />
        );

        fireEvent.press(getByTestId('inventory-count-save-button'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('No employee found');
            expect(mockInventoryCountSave).not.toHaveBeenCalled();
            expect(mockGoBack).not.toHaveBeenCalled();
        });
    });

    it('auto-adds scanner-like single match and avoids duplicates', async () => {
        mockProductSearch.mockReturnValue({
            items: [mockProducts[0]],
            allNumbers: true,
        });
        const { getByTestId, getByText } = render(
            <InventoryCountForm route={route} navigation={navigation} />
        );

        fireEvent.press(getByTestId('inventory-count-search-submit'));
        fireEvent.press(getByTestId('inventory-count-search-clear'));
        fireEvent.press(getByTestId('compact-product-list-close'));
        await waitFor(() => {
            expect(getByText('Count Progress: 0 / 1')).toBeTruthy();
        });

        fireEvent.press(getByTestId('inventory-count-search-submit'));
        await waitFor(() => {
            expect(getByText('Count Progress: 0 / 1')).toBeTruthy();
        });
    });

    it('switches between quick and full mode and restores quick lines', async () => {
        mockProductSearch.mockReturnValue({
            items: [mockProducts[0]],
            allNumbers: true,
        });
        const { getByTestId, getByText } = render(
            <InventoryCountForm route={route} navigation={navigation} />
        );

        fireEvent.press(getByTestId('inventory-count-search-submit'));
        await waitFor(() => {
            expect(getByText('Count Progress: 0 / 1')).toBeTruthy();
        });

        fireEvent.press(getByTestId('inventory-count-mode-full'));
        await waitFor(() => {
            expect(getByText('Count Progress: 0 / 2')).toBeTruthy();
        });

        fireEvent.press(getByTestId('inventory-count-mode-quick'));
        await waitFor(() => {
            expect(getByText('Count Progress: 0 / 1')).toBeTruthy();
        });
    });

    it('supports line update and delete callbacks', async () => {
        mockProductSearch.mockReturnValue({
            items: [mockProducts[0]],
            allNumbers: true,
        });
        const { getByTestId, getByText } = render(
            <InventoryCountForm route={route} navigation={navigation} />
        );

        fireEvent.press(getByTestId('inventory-count-search-submit'));
        await waitFor(() => expect(getByText('Count Progress: 0 / 1')).toBeTruthy());

        fireEvent.press(getByTestId('inventory-count-line-update-p-1'));
        await waitFor(() => expect(getByText('Count Progress: 1 / 1')).toBeTruthy());

        fireEvent.press(getByTestId('inventory-count-line-delete-p-1'));
        await waitFor(() => expect(getByText('Count Progress: 0 / 0')).toBeTruthy());
    });

    it('saves existing selected count preserving id when all lines have new count', async () => {
        mockSelectedInventoryCount = {
            id: 'count-42',
            status: 'IN_PROGRESS',
            comments: 'existing',
            lines: [
                {
                    productId: 'p-1',
                    productName: 'Apple',
                    unitOfMeasure: 'EA',
                    current: 10,
                    newCount: 12,
                    comments: '',
                },
            ],
        };

        const { getByTestId } = render(
            <InventoryCountForm route={route} navigation={navigation} />
        );

        fireEvent.press(getByTestId('inventory-count-save-button'));

        await waitFor(() => {
            expect(mockInventoryCountSave).toHaveBeenCalledWith(
                mockDispatch,
                expect.objectContaining({
                    id: 'count-42',
                    status: 'IN_PROGRESS',
                }),
                false
            );
        });
    });

    it('shows compact product list for non-scanner search results', async () => {
        mockProductSearch.mockReturnValue({
            items: [mockProducts[0], mockProducts[1]],
            allNumbers: false,
        });

        const { getByTestId, getByText } = render(
            <InventoryCountForm route={route} navigation={navigation} />
        );

        fireEvent.press(getByTestId('inventory-count-search-submit'));

        await waitFor(() => {
            expect(getByText('visible')).toBeTruthy();
        });
    });

    it('handles cancel confirmation and clears selection', () => {
        const { getByTestId } = render(
            <InventoryCountForm route={route} navigation={navigation} />
        );
        fireEvent.press(getByTestId('inventory-count-cancel-button'));

        const options = (Alert.alert as jest.Mock).mock.calls[0][2];
        const yesOption = options.find((o: { text: string }) => o.text === 'Yes');
        yesOption.onPress();

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'inventoryCount/clearSelection',
        });
        expect(mockGoBack).toHaveBeenCalled();
    });
});

describe('InventoryCountForm helpers', () => {
    it('appends count line only when product is missing', () => {
        const existing = [
            { productId: 'p-1', productName: 'Apple', unitOfMeasure: 'EA' },
        ];
        const product = {
            id: 'p-1',
            name: 'Apple',
            unitOfMeasure: 'EA',
            quantity: 10,
        };
        const nextProduct = {
            id: 'p-2',
            name: 'Banana',
            unitOfMeasure: 'EA',
            quantity: 20,
        };

        const duplicateResult = appendCountLineIfMissing(existing as any, product as any);
        const addResult = appendCountLineIfMissing(existing as any, nextProduct as any);

        expect(duplicateResult.added).toBe(false);
        expect(duplicateResult.nextLines).toBe(existing);
        expect(addResult.added).toBe(true);
        expect(addResult.nextLines).toHaveLength(2);
    });

    it('updates existing count line and ignores missing ones', () => {
        const lines = [
            {
                productId: 'p-1',
                productName: 'Apple',
                unitOfMeasure: 'EA',
                current: 10,
                newCount: 10,
                comments: '',
            },
        ];

        const updated = applyCountLineUpdate(lines as any, {
            productId: 'p-1',
            newCount: 12,
            comments: 'counted',
        } as any);
        const unchanged = applyCountLineUpdate(lines as any, {
            productId: 'missing',
            newCount: 0,
            comments: 'n/a',
        } as any);

        expect(updated[0].newCount).toBe(12);
        expect(updated[0].comments).toBe('counted');
        expect(unchanged).toBe(lines);
    });

    it('normalizes codes and matches barcode/sku/plu exactly', () => {
        const product = {
            barcode: ' 12345 ',
            sku: ' AbC-1 ',
            plu: ' 77 ',
        };

        expect(normalizeCode(' AbC ')).toBe('abc');
        expect(normalizeCode(undefined)).toBe('');
        expect(isExactCodeMatch(product, '12345')).toBe(true);
        expect(isExactCodeMatch(product, 'abc-1')).toBe(true);
        expect(isExactCodeMatch(product, '77')).toBe(true);
        expect(isExactCodeMatch(product, '')).toBe(false);
        expect(isExactCodeMatch(product, 'does-not-match')).toBe(false);
    });

    it('builds full-count lines from active tracked products and keeps manual lines', () => {
        const existingLines = [
            {
                productId: 'p-1',
                productName: 'Apple',
                unitOfMeasure: 'EA',
                current: 10,
                newCount: 11,
                comments: 'counted',
            },
            {
                productId: 'manual-1',
                productName: 'Manual Product',
                unitOfMeasure: 'EA',
                current: 0,
                newCount: 1,
                comments: 'manual',
            },
        ];
        const products = [
            { id: 'p-2', name: 'Banana', isActive: true, trackStock: true, unitOfMeasure: 'EA', quantity: 20 },
            { id: 'p-1', name: 'Apple', isActive: true, trackStock: true, unitOfMeasure: 'EA', quantity: 10 },
            { id: 'p-3', name: 'Inactive', isActive: false, trackStock: true, unitOfMeasure: 'EA', quantity: 5 },
            { id: 'p-4', name: 'NoTrack', isActive: true, trackStock: false, unitOfMeasure: 'EA', quantity: 7 },
        ];

        const result = asFullCountLines(existingLines, products);

        expect(result.map((line: any) => line.productId)).toEqual([
            'p-1',
            'p-2',
            'manual-1',
        ]);
        expect(result[0].newCount).toBe(11);
        expect(result[1]).toEqual(
            expect.objectContaining({
                productId: 'p-2',
                current: 20,
            })
        );
    });
});
