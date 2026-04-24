/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

const mockDispatch = jest.fn();
const mockGoBack = jest.fn();
const mockConfirm = jest.fn((_: string, __: string, onConfirm: () => void) => onConfirm());
const mockInventoryReceiveSave = jest.fn(() => Promise.resolve(true));
const mockProductSearch = jest.fn(() => ({ items: [], allNumbers: false }));
const mockProducts: unknown[] = [];
let mockInventoryReceiveSelected: any = null;
let mockEmployee: any = {
    id: 'emp-1',
    firstName: 'Test',
    lastName: 'User',
};
const mockState = {
    inventoryReceive: {} as any,
};

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: (state: unknown) => unknown) =>
        selector({
            ...mockState,
            inventoryReceive: { selected: mockInventoryReceiveSelected },
        }),
}));

jest.mock('@pos/store', () => ({
    useAppDispatch: () => mockDispatch,
}));

jest.mock('@pos/theme/native', () => ({
    getThemeColors: () => ({
        primary: '#00f',
        background: '#fff',
        card: '#111',
        border: '#333',
        text: '#fff',
        textMuted: '#999',
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
        colors: {
            canvas: '#000',
            primary: '#00f',
            text: '#fff',
            borderSubtle: '#333',
            surfaceRaised: '#111',
        },
        spacing: {
            xs: 4,
            sm: 8,
            md: 12,
            lg: 16,
            xl: 24,
            xxl: 32,
        },
        radius: {
            md: 12,
            lg: 16,
        },
    }),
}));

jest.mock('@pos/shared/ui-native', () => ({
    UIActions: ({
        submitAction,
        cancelAction,
        busy,
        submitLoading,
    }: {
        submitAction: () => void;
        cancelAction: () => void;
        busy?: boolean;
        submitLoading?: boolean;
    }) => {
        const { Pressable: RNPressable, Text: RNText, View: RNView } = require('react-native');
        return (
            <RNView>
                <RNPressable
                    testID="inventory-receive-save-button"
                    onPress={submitAction}
                    disabled={busy}
                    accessibilityState={{ disabled: !!busy }}
                >
                    <RNText>{submitLoading ? 'Save loading' : 'Save'}</RNText>
                </RNPressable>
                <RNPressable
                    testID="inventory-receive-cancel-button"
                    onPress={cancelAction}
                    disabled={busy}
                    accessibilityState={{ disabled: !!busy }}
                >
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
                    value,
                    onChangeText,
                    onSubmit,
                    onClear,
                }: {
                    value?: string;
                    onChangeText?: (text: string) => void;
                    onSubmit: (text: string) => void;
                    onClear: () => void;
                },
                _
            ) => {
                const {
                    Pressable: RNPressable,
                    Text: RNText,
                    TextInput: RNTextInput,
                    View: RNView,
                } = require('react-native');
                return (
                    <RNView testID="inventory-receive-search">
                        <RNTextInput
                            testID="inventory-receive-search-input"
                            value={value}
                            onChangeText={onChangeText}
                        />
                        <RNPressable
                            testID="inventory-receive-search-submit"
                            onPress={() => onSubmit('111')}
                        >
                            <RNText>Submit Search</RNText>
                        </RNPressable>
                        <RNPressable testID="inventory-receive-search-clear" onPress={onClear}>
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
    Button: ({
        title,
        onPress,
        testID,
        disabled,
        loading,
    }: {
        title?: string;
        onPress: () => void;
        testID?: string;
        disabled?: boolean;
        loading?: boolean;
    }) => {
        const { Pressable: RNPressable, Text: RNText } = require('react-native');
        return (
            <RNPressable
                testID={testID || title}
                onPress={onPress}
                disabled={disabled}
                accessibilityState={{ disabled: !!disabled }}
            >
                <RNText>{loading ? `${title || 'button'} loading` : title || 'button'}</RNText>
            </RNPressable>
        );
    },
}));

jest.mock('@pos/shared/utils', () => ({
    confirm: (title: string, message: string, onConfirm: () => void) =>
        mockConfirm(title, message, onConfirm),
    translateWithFallback: (_key: string, fallback: string) => fallback,
}));

jest.mock('@pos/products/data-access', () => ({
    ProductService: {
        search: (...args: unknown[]) => mockProductSearch(...args),
    },
    selectAllProducts: () => mockProducts,
    subscribeToProductChanges: () => ({ unsubscribe: jest.fn() }),
}));

jest.mock('@pos/employees/data-access', () => ({
    selectLoginEmployee: () => mockEmployee,
}));

jest.mock('../inventory-receives/inventory-receive-line', () => ({
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
            <RNView testID="inventory-receive-line">
                <RNPressable
                    testID={`inventory-receive-line-update-${item.productId}`}
                    onPress={() =>
                        onUpdate({
                            ...item,
                            received: 8,
                            comments: 'updated',
                        })
                    }
                >
                    <RNText>Update Line</RNText>
                </RNPressable>
                <RNPressable
                    testID={`inventory-receive-line-delete-${item.productId}`}
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
                    testID="inventory-receive-add-product"
                    onPress={() =>
                        onAdd({
                            id: 'p-1',
                            name: 'Apple',
                            unitOfMeasure: 'EA',
                            quantity: 10,
                        })
                    }
                >
                    <RNText>Add Product</RNText>
                </RNPressable>
                <RNPressable testID="inventory-receive-close-product-list" onPress={onClose}>
                    <RNText>Close Product List</RNText>
                </RNPressable>
            </RNView>
        );
    },
}));

jest.mock('@pos/inventory/data-access', () => ({
    inventoryReceiveActions: {
        clearSelection: () => ({ type: 'inventoryReceive/clearSelection' }),
    },
    InventoryReceiveLineMapper: {
        fromProduct: (product: { id: string; name: string; unitOfMeasure: string; quantity: number }) => ({
            productId: product.id,
            productName: product.name,
            unitOfMeasure: product.unitOfMeasure,
            current: product.quantity,
            received: 0,
            comments: '',
        }),
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

const {
    InventoryReceiveForm,
    appendReceiveLineIfMissing,
    applyReceiveLineUpdate,
} = require('./inventory-receive-form');

describe('InventoryReceiveForm integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockInventoryReceiveSelected = null;
        mockEmployee = { id: 'emp-1', firstName: 'Test', lastName: 'User' };
        mockProductSearch.mockReturnValue({ items: [], allNumbers: false });
        jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
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

    it('stays on the form when the receive service reports failure', async () => {
        mockInventoryReceiveSave.mockResolvedValueOnce(false);

        const { getByTestId } = render(
            <InventoryReceiveForm route={route} navigation={navigation} />
        );

        fireEvent.press(getByTestId('inventory-receive-save-button'));

        await waitFor(() => {
            expect(mockInventoryReceiveSave).toHaveBeenCalled();
        });
        expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('uses the latest line values when completing a receive', async () => {
        mockInventoryReceiveSelected = {
            id: 'recv-1',
            comments: 'existing',
            status: 'IN_PROGRESS',
            lines: [
                {
                    productId: 'p-1',
                    productName: 'Aceitunas Jumbo',
                    unitOfMeasure: 'EA',
                    received: 4,
                    comments: '',
                },
            ],
        };
        (mockProducts as any[]).splice(0, mockProducts.length, {
            id: 'p-1',
            name: 'Aceitunas Jumbo',
            unitOfMeasure: 'EA',
            quantity: 4,
        });

        const { getByTestId } = render(
            <InventoryReceiveForm route={route} navigation={navigation} />
        );

        fireEvent.press(getByTestId('inventory-receive-line-update-p-1'));
        fireEvent.press(getByTestId('inventory-receive-update-inventory-button'));

        await waitFor(() => {
            expect(mockInventoryReceiveSave).toHaveBeenCalledWith(
                mockDispatch,
                expect.objectContaining({
                    id: 'recv-1',
                    status: 'COMPLETED',
                    lines: [
                        expect.objectContaining({
                            productId: 'p-1',
                            received: 8,
                            comments: 'updated',
                        }),
                    ],
                }),
                true
            );
        });
    });

    it('alerts when logged in employee details are missing', async () => {
        mockEmployee = null;

        const { getByTestId } = render(
            <InventoryReceiveForm route={route} navigation={navigation} />
        );

        fireEvent.press(getByTestId('inventory-receive-save-button'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'The system could not find the details of the logged in employee'
            );
            expect(mockInventoryReceiveSave).not.toHaveBeenCalled();
            expect(mockGoBack).not.toHaveBeenCalled();
        });
    });

    it('shows read-only warning and hides action buttons in read-only mode', () => {
        const readOnlyRoute = { params: { readOnly: true } };

        const { queryByTestId, getByText } = render(
            <InventoryReceiveForm route={readOnlyRoute as any} navigation={navigation} />
        );

        expect(getByText('Completed receive')).toBeTruthy();
        expect(
            getByText('This inventory receive is read-only and cannot be changed.')
        ).toBeTruthy();
        expect(queryByTestId('inventory-receive-save-button')).toBeNull();
        expect(queryByTestId('inventory-receive-update-inventory-button')).toBeNull();
    });

    it('supports search + add + update + delete line flow', async () => {
        mockProductSearch.mockReturnValue({
            items: [
                {
                    id: 'p-1',
                    name: 'Apple',
                    unitOfMeasure: 'EA',
                    quantity: 10,
                },
            ],
            allNumbers: false,
        });
        const { getByTestId, getAllByTestId } = render(
            <InventoryReceiveForm route={route} navigation={navigation} />
        );

        fireEvent.press(getByTestId('inventory-receive-search-submit'));
        fireEvent.press(getByTestId('inventory-receive-add-product'));
        await waitFor(() => {
            expect(getAllByTestId('inventory-receive-line').length).toBe(1);
        });

        fireEvent.press(getByTestId('inventory-receive-line-update-p-1'));
        fireEvent.press(getByTestId('inventory-receive-line-delete-p-1'));
        await waitFor(() => {
            expect(mockInventoryReceiveSave).not.toHaveBeenCalled();
        });
    });

    it('allows searching again after adding a product line', async () => {
        mockProductSearch.mockReturnValue({
            items: [
                {
                    id: 'p-1',
                    name: 'Apple',
                    unitOfMeasure: 'EA',
                    quantity: 10,
                },
            ],
            allNumbers: false,
        });
        const { getByTestId } = render(
            <InventoryReceiveForm route={route} navigation={navigation} />
        );

        fireEvent.press(getByTestId('inventory-receive-search-submit'));
        fireEvent.press(getByTestId('inventory-receive-add-product'));
        fireEvent.changeText(getByTestId('inventory-receive-search-input'), 'b');

        expect(getByTestId('inventory-receive-search-input').props.value).toBe('b');
    });

    it('prevents duplicate save while busy', async () => {
        let resolveSave: (() => void) | null = null;
        mockInventoryReceiveSave.mockImplementationOnce(
            () =>
                new Promise<void>((resolve) => {
                    resolveSave = resolve;
                })
        );

        const { getByTestId } = render(
            <InventoryReceiveForm route={route} navigation={navigation} />
        );

        fireEvent.press(getByTestId('inventory-receive-save-button'));
        fireEvent.press(getByTestId('inventory-receive-save-button'));

        await waitFor(() => {
            expect(mockInventoryReceiveSave).toHaveBeenCalledTimes(1);
        });

        await act(async () => {
            resolveSave?.();
        });
    });

    it('locks actions and shows loading feedback while saving a draft', async () => {
        let resolveSave: (() => void) | null = null;
        mockInventoryReceiveSave.mockImplementationOnce(
            () =>
                new Promise<void>((resolve) => {
                    resolveSave = resolve;
                })
        );

        const { getByTestId, getByText } = render(
            <InventoryReceiveForm route={route} navigation={navigation} />
        );

        fireEvent.press(getByTestId('inventory-receive-save-button'));

        await waitFor(() => {
            expect(getByText('Save loading')).toBeTruthy();
            expect(getByTestId('inventory-receive-save-button').props.accessibilityState.disabled).toBe(true);
            expect(getByTestId('inventory-receive-cancel-button').props.accessibilityState.disabled).toBe(true);
            expect(
                getByTestId('inventory-receive-update-inventory-button').props.accessibilityState.disabled
            ).toBe(true);
        });

        await act(async () => {
            resolveSave?.();
        });
    });

    it('shows loading feedback on update inventory while finalizing', async () => {
        let resolveSave: (() => void) | null = null;
        mockInventoryReceiveSave.mockImplementationOnce(
            () =>
                new Promise<void>((resolve) => {
                    resolveSave = resolve;
                })
        );

        const { getByTestId, getByText } = render(
            <InventoryReceiveForm route={route} navigation={navigation} />
        );

        fireEvent.press(getByTestId('inventory-receive-update-inventory-button'));

        await waitFor(() => {
            expect(getByText('Update Inventory loading')).toBeTruthy();
            expect(getByTestId('inventory-receive-save-button').props.accessibilityState.disabled).toBe(true);
            expect(getByTestId('inventory-receive-cancel-button').props.accessibilityState.disabled).toBe(true);
            expect(
                getByTestId('inventory-receive-update-inventory-button').props.accessibilityState.disabled
            ).toBe(true);
        });

        await act(async () => {
            resolveSave?.();
        });
    });

    it('loads existing selected receive and supports cancel confirmation', () => {
        mockInventoryReceiveSelected = {
            id: 'recv-1',
            comments: 'existing',
            status: 'IN_PROGRESS',
            lines: [
                {
                    productId: 'p-1',
                    productName: 'Apple',
                    unitOfMeasure: 'EA',
                    current: 10,
                    received: 2,
                    comments: '',
                },
            ],
        };
        const { getByTestId } = render(
            <InventoryReceiveForm route={route} navigation={navigation} />
        );
        fireEvent.press(getByTestId('inventory-receive-cancel-button'));

        const options = (Alert.alert as jest.Mock).mock.calls[0][2];
        const yesOption = options.find((o: { text: string }) => o.text === 'Yes');
        yesOption.onPress();

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'inventoryReceive/clearSelection',
        });
        expect(mockGoBack).toHaveBeenCalled();
    });

    it('saves selected receive preserving id/status and supports clear/close search interactions', async () => {
        mockInventoryReceiveSelected = {
            id: 'recv-2',
            comments: 'existing',
            status: 'IN_PROGRESS',
            lines: [],
        };

        const { getByTestId } = render(
            <InventoryReceiveForm route={route} navigation={navigation} />
        );

        fireEvent.press(getByTestId('inventory-receive-search-clear'));
        fireEvent.press(getByTestId('inventory-receive-search-submit'));
        fireEvent.press(getByTestId('inventory-receive-close-product-list'));
        fireEvent.press(getByTestId('inventory-receive-save-button'));

        await waitFor(() => {
            expect(mockInventoryReceiveSave).toHaveBeenCalledWith(
                mockDispatch,
                expect.objectContaining({
                    id: 'recv-2',
                    status: 'IN_PROGRESS',
                }),
                false
            );
        });
    });
});

describe('InventoryReceiveForm helpers', () => {
    it('appends receive line only when product does not exist yet', () => {
        const lines = [
            { productId: 'p-1', productName: 'Apple', unitOfMeasure: 'EA' },
        ];
        const sameProduct = {
            id: 'p-1',
            name: 'Apple',
            unitOfMeasure: 'EA',
            quantity: 10,
        };
        const otherProduct = {
            id: 'p-2',
            name: 'Banana',
            unitOfMeasure: 'EA',
            quantity: 20,
        };

        const duplicate = appendReceiveLineIfMissing(lines as any, sameProduct as any);
        const added = appendReceiveLineIfMissing(lines as any, otherProduct as any);

        expect(duplicate.added).toBe(false);
        expect(duplicate.nextLines).toBe(lines);
        expect(added.added).toBe(true);
        expect(added.nextLines).toHaveLength(2);
    });

    it('updates receive line values and keeps array unchanged when missing', () => {
        const lines = [
            {
                productId: 'p-1',
                productName: 'Apple',
                unitOfMeasure: 'EA',
                current: 10,
                received: 1,
                comments: '',
            },
        ];

        const updated = applyReceiveLineUpdate(lines as any, {
            productId: 'p-1',
            received: 5,
            comments: 'updated',
        } as any);
        const unchanged = applyReceiveLineUpdate(lines as any, {
            productId: 'missing',
            received: 0,
            comments: 'none',
        } as any);

        expect(updated[0].received).toBe(5);
        expect(updated[0].comments).toBe('updated');
        expect(unchanged).toBe(lines);
    });
});
