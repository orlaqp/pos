/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

const mockDispatch = jest.fn();
const mockGoBack = jest.fn();
const mockFetchStoreInfo = jest.fn(() => ({ type: 'storeInfo/fetch' }));
const mockStoreInfoSave = jest.fn(() => Promise.resolve());
let mockStoreInfo: any = {
    id: 'store-1',
    name: 'Main Store',
    address: '123 Main St',
    city: 'Miami',
    state: 'FL',
    zipCode: '33101',
    email: 'store@example.com',
    phone: '3050000000',
    fax: '3050000001',
    disclaimer: 'Thanks',
};

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: () => unknown) => selector(),
}));

jest.mock('@pos/theme/native/design-tokens', () => ({
    useDesignTokens: () => ({
        spacing: { xs: 4, md: 12, lg: 16, xl: 24 },
        colors: { textPrimary: '#fff', textSecondary: '#9aa6b5' },
    }),
}));

jest.mock('@pos/shared/ui-native', () => ({
    UIScreen: ({ children }: { children: React.ReactNode }) => {
        const { View } = require('react-native');
        return <View>{children}</View>;
    },
    UICard: ({ children }: { children: React.ReactNode }) => {
        const { View } = require('react-native');
        return <View>{children}</View>;
    },
    UIStack: ({ children }: { children: React.ReactNode }) => {
        const { View } = require('react-native');
        return <View>{children}</View>;
    },
    UIActions: ({
        submitAction,
        cancelAction,
    }: {
        submitAction: () => void;
        cancelAction: () => void;
    }) => {
        const { View, Pressable, Text } = require('react-native');
        return (
            <View>
                <Pressable testID="store-info-save" onPress={submitAction}>
                    <Text>Save</Text>
                </Pressable>
                <Pressable testID="store-info-cancel" onPress={cancelAction}>
                    <Text>Cancel</Text>
                </Pressable>
            </View>
        );
    },
    UIInput: ({ name }: { name: string }) => {
        const { View } = require('react-native');
        return <View testID={`store-info-input-${name}`} />;
    },
}));

jest.mock('@pos/store-info/data-access', () => ({
    fetchStoreInfo: () => mockFetchStoreInfo(),
    selectStore: () => mockStoreInfo,
    StoreInfoService: {
        save: (...args: unknown[]) => mockStoreInfoSave(...args),
    },
}));

const { StoreInfoForm } = require('./store-info-form');

describe('StoreInfoForm integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockStoreInfo = {
            id: 'store-1',
            name: 'Main Store',
            address: '123 Main St',
            city: 'Miami',
            state: 'FL',
            zipCode: '33101',
            email: 'store@example.com',
            phone: '3050000000',
            fax: '3050000001',
            disclaimer: 'Thanks',
        };
        jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    });

    it('dispatches fetchStoreInfo on mount', () => {
        const navigation = { goBack: mockGoBack };
        render(<StoreInfoForm navigation={navigation as any} />);
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'storeInfo/fetch' }));
    });

    it('saves and shows success alert on submit', async () => {
        const navigation = { goBack: mockGoBack };
        const { getByTestId } = render(<StoreInfoForm navigation={navigation as any} />);

        fireEvent.press(getByTestId('store-info-save'));

        await waitFor(() => {
            expect(mockStoreInfoSave).toHaveBeenCalledWith(
                mockDispatch,
                expect.objectContaining({ id: 'store-1', name: 'Main Store' })
            );
            expect(Alert.alert).toHaveBeenCalledWith('Store information has been updated');
        });
    });

    it('confirms cancel and navigates back on confirmation', () => {
        const navigation = { goBack: mockGoBack };
        const { getByTestId } = render(<StoreInfoForm navigation={navigation as any} />);

        fireEvent.press(getByTestId('store-info-cancel'));

        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const options = alertCall[2];
        const yesOption = options.find((o: { text: string }) => o.text === 'Yes');
        yesOption.onPress();
        expect(mockGoBack).toHaveBeenCalled();
    });

    it('does not navigate back when cancel confirmation is declined', () => {
        const navigation = { goBack: mockGoBack };
        const { getByTestId } = render(<StoreInfoForm navigation={navigation as any} />);

        fireEvent.press(getByTestId('store-info-cancel'));

        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const options = alertCall[2];
        const noOption = options.find((o: { text: string }) => o.text === 'No');
        if (typeof noOption.onPress === 'function') {
            noOption.onPress();
        }
        expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('omits id when saving a new store info record', async () => {
        mockStoreInfo = {
            name: 'New Store',
            address: 'Address',
        };
        const navigation = { goBack: mockGoBack };
        const { getByTestId } = render(<StoreInfoForm navigation={navigation as any} />);

        fireEvent.press(getByTestId('store-info-save'));

        await waitFor(() => {
            const savedPayload = mockStoreInfoSave.mock.calls[0][1];
            expect(savedPayload.id).toBeUndefined();
        });
    });

    it('shows an error alert when save fails', async () => {
        mockStoreInfoSave.mockRejectedValueOnce(
            new Error('Store information is not available yet.')
        );
        const navigation = { goBack: mockGoBack };
        const { getByTestId } = render(<StoreInfoForm navigation={navigation as any} />);

        fireEvent.press(getByTestId('store-info-save'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Unable to save store information',
                'Store information is not available yet.'
            );
        });
    });

    it('allows saving when fax is blank', async () => {
        mockStoreInfo = {
            ...mockStoreInfo,
            fax: '',
        };
        const navigation = { goBack: mockGoBack };
        const { getByTestId } = render(<StoreInfoForm navigation={navigation as any} />);

        fireEvent.press(getByTestId('store-info-save'));

        await waitFor(() => {
            expect(mockStoreInfoSave).toHaveBeenCalledWith(
                mockDispatch,
                expect.objectContaining({
                    id: 'store-1',
                    fax: '',
                })
            );
        });
    });
});
