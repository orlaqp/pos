/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert, Pressable, Text, View } from 'react-native';

const mockDispatch = jest.fn();
const mockGoBack = jest.fn();
const mockConfirm = jest.fn((_: string, __: string, onConfirm: () => void) => onConfirm());
const mockInventoryReceiveSave = jest.fn(() => Promise.resolve());
const mockProductSearch = jest.fn(() => ({ items: [], allNumbers: false }));
const mockFetchProducts = jest.fn(() => ({ type: 'products/fetchStatus/pending' }));
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
    UISearchInput: React.forwardRef(
        (
            {
                onSubmit,
                onClear,
            }: { onSubmit: (text: string) => void; onClear: () => void },
            _
        ) => (
            <View testID="inventory-receive-search">
                <Pressable
                    testID="inventory-receive-search-submit"
                    onPress={() => onSubmit('111')}
                >
                    <Text>Submit Search</Text>
                </Pressable>
                <Pressable testID="inventory-receive-search-clear" onPress={onClear}>
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
    fetchProducts: (...args: unknown[]) => mockFetchProducts(...args),
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
    }) => (
        <View testID="inventory-receive-line">
            <Pressable
                testID={`inventory-receive-line-update-${item.productId}`}
                onPress={() =>
                    onUpdate({
                        ...item,
                        received: 8,
                        comments: 'updated',
                    })
                }
            >
                <Text>Update Line</Text>
            </Pressable>
            <Pressable
                testID={`inventory-receive-line-delete-${item.productId}`}
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
                <Text>Add Product</Text>
            </Pressable>
            <Pressable testID="inventory-receive-close-product-list" onPress={onClose}>
                <Text>Close Product List</Text>
            </Pressable>
        </View>
    ),
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
        mockFetchProducts.mockReturnValue({ type: 'products/fetchStatus/pending' });
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
            expect(mockFetchProducts).toHaveBeenCalled();
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

        expect(
            getByText('This receive was already completed and cannot be changed')
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

        resolveSave?.();
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
