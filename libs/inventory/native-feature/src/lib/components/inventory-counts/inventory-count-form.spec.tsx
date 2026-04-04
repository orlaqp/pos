/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

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
    getThemeColors: () => ({
        grey0: '#fff',
        grey5: '#ccc',
        background: '#000',
        black: '#000',
        white: '#fff',
        primary: '#00f',
        error: '#f00',
    }),
    useSharedStyles: () => ({
        page: {},
        secondaryText: {},
        primaryText: {},
        textCenter: {},
        textBold: {},
        darkBackground: {},
    }),
}));

jest.mock('@pos/theme/native/design-tokens', () => ({
    useDesignTokens: () => ({
        spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
        radius: { md: 8, lg: 12 },
        colors: {
            canvas: '#000',
            surface: '#111',
            border: '#222',
            text: '#fff',
            textMuted: '#999',
            primary: '#00f',
        },
    }),
}));

jest.mock('@pos/shared/ui-native', () => ({
    UIActions: ({ submitAction, cancelAction }: { submitAction: () => void; cancelAction: () => void }) => {
        const { Pressable: RNPressable, Text: RNText, View: RNView } = require('react-native');
        return (
            <RNView>
                <RNPressable testID="inventory-count-save-button" onPress={submitAction}>
                    <RNText>Save</RNText>
                </RNPressable>
                <RNPressable testID="inventory-count-cancel-button" onPress={cancelAction}>
                    <RNText>Cancel</RNText>
                </RNPressable>
            </RNView>
        );
    },
    UISearchInput: (() => {
        const React = require('react');
        return React.forwardRef(
            (
                {
                    onSubmit,
                    onClear,
                }: {
                    onSubmit: (text: string) => void;
                    onClear: () => void;
                },
                _
            ) => {
                const { Pressable: RNPressable, Text: RNText, View: RNView } = require('react-native');
                return (
                    <RNView testID="inventory-count-search">
                        <RNPressable
                            testID="inventory-count-search-submit"
                            onPress={() => onSubmit('111')}
                        >
                            <RNText>Submit Search</RNText>
                        </RNPressable>
                        <RNPressable testID="inventory-count-search-clear" onPress={onClear}>
                            <RNText>Clear Search</RNText>
                        </RNPressable>
                    </RNView>
                );
            }
        );
    })(),
    UIScreen: ({ children }: { children: React.ReactNode }) => {
        const { View: RNView } = require('react-native');
        return <RNView>{children}</RNView>;
    },
    UICard: ({ children }: { children: React.ReactNode }) => {
        const { View: RNView } = require('react-native');
        return <RNView>{children}</RNView>;
    },
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
    Button: ({ title, onPress, testID }: { title?: string; onPress: () => void; testID?: string }) => {
        const { Pressable: RNPressable, Text: RNText } = require('react-native');
        return (
            <RNPressable testID={testID || title} onPress={onPress}>
                <RNText>{title || 'button'}</RNText>
            </RNPressable>
        );
    },
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

jest.mock('@pos/store', () => ({
    useAppDispatch: () => mockDispatch,
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
    }) => {
        const { Pressable: RNPressable, Text: RNText, View: RNView } = require('react-native');
        return (
            <RNView testID="inventory-count-line">
                <RNPressable
                    testID={`inventory-count-line-update-${item.productId}`}
                    onPress={() =>
                        onUpdate({
                            ...item,
                            newCount: 33,
                            comments: 'updated',
                        })
                    }
                >
                    <RNText>Update Line</RNText>
                </RNPressable>
                <RNPressable
                    testID={`inventory-count-line-delete-${item.productId}`}
                    onPress={() => onDelete(item)}
                >
                    <RNText>Delete Line</RNText>
                </RNPressable>
            </RNView>
        );
    },
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
    }) => {
        const { Pressable: RNPressable, Text: RNText, View: RNView } = require('react-native');
        return (
            <RNView testID="compact-product-list">
                <RNText>{visible ? 'visible' : 'hidden'}</RNText>
                <RNPressable
                    testID="compact-product-list-add"
                    onPress={() => onAdd(mockProducts[0])}
                >
                    <RNText>Add Product</RNText>
                </RNPressable>
                <RNPressable testID="compact-product-list-close" onPress={onClose}>
                    <RNText>Close Product List</RNText>
                </RNPressable>
            </RNView>
        );
    },
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
        expect(updated[0]).not.toBe(lines[0]);
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
