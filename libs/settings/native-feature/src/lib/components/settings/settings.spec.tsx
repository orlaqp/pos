/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Pressable, Switch, Text, View } from 'react-native';

const mockDispatch = jest.fn();
const mockUpdateTheme = jest.fn();
const mockSetThemeAction = jest.fn((payload) => ({
    type: 'settings/set',
    payload,
}));
const mockResetDataStore = jest.fn(() => ({
    type: 'settings/reset/pending',
}));
const mockFetchGlobalSettings = jest.fn((payload) => ({
    type: 'globalSettings/fetch/pending',
    payload,
}));

const mockSettingsState = {
    darkTheme: false,
    dataStoreStatus: 'synced',
    languageTag: 'en',
    globalSettings: {
        id: 'global-settings-id',
        enforceSalesBasedOnInventory: false,
    },
};

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: jest.fn(() => mockSettingsState),
}));

jest.mock('@pos/theme/native/design-tokens', () => ({
    useDesignTokens: () => ({
        spacing: { lg: 16, xl: 24 },
        layout: { contentMaxWidth: 1200 },
        colors: { textPrimary: '#ffffff' },
    }),
}));

jest.mock('@pos/shared/ui-native', () => ({
    UIScreen: ({ children, testID }: { children: React.ReactNode; testID?: string }) => (
        <View testID={testID || 'ui-screen'}>{children}</View>
    ),
    UIStack: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    UICard: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
}));

jest.mock('@rneui/themed', () => ({
    useTheme: () => ({
        updateTheme: mockUpdateTheme,
    }),
    Switch: ({
        testID,
        value,
        onValueChange,
    }: {
        testID?: string;
        value?: boolean;
        onValueChange: (value: boolean) => void;
    }) => (
        <Switch
            testID={testID}
            value={!!value}
            onValueChange={onValueChange}
        />
    ),
    Button: ({
        title,
        onPress,
        testID,
    }: {
        title?: string;
        onPress: () => void;
        testID?: string;
    }) => (
        <Pressable onPress={onPress} testID={testID || title}>
            <Text>{title || 'button'}</Text>
        </Pressable>
    ),
}));

jest.mock('@pos/settings/data-access', () => ({
    selectSettings: jest.fn(),
    settingsActions: {
        set: (payload: boolean) => mockSetThemeAction(payload),
    },
    resetDataStore: () => mockResetDataStore(),
    fetchGlobalSettings: (payload: unknown) => mockFetchGlobalSettings(payload),
}));

const { Settings } = require('./settings');

describe('Settings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSettingsState.darkTheme = false;
        mockSettingsState.dataStoreStatus = 'synced';
        mockSettingsState.globalSettings = {
            id: 'global-settings-id',
            enforceSalesBasedOnInventory: false,
        };
    });

    it('renders sections and labels', () => {
        const { getByTestId, getByText } = render(<Settings />);

        expect(getByTestId('settings-screen')).toBeTruthy();
        expect(getByText('Use Dark Theme:')).toBeTruthy();
        expect(getByText('Enforce Sales Based on Inventory:')).toBeTruthy();
        expect(getByText('Reset Data')).toBeTruthy();
    });

    it('dispatches theme action and updates theme mode when dark theme changes', () => {
        const { getByTestId } = render(<Settings />);

        fireEvent(getByTestId('settings-dark-theme-switch'), 'valueChange', true);

        expect(mockUpdateTheme).toHaveBeenCalledWith({ mode: 'dark' });
        expect(mockSetThemeAction).toHaveBeenCalledWith(true);
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'settings/set',
            payload: true,
        });
    });

    it('dispatches global settings refresh when enforce inventory changes', () => {
        const { getByTestId } = render(<Settings />);

        fireEvent(
            getByTestId('settings-enforce-inventory-switch'),
            'valueChange',
            true
        );

        expect(mockFetchGlobalSettings).toHaveBeenCalledWith({
            id: 'global-settings-id',
            enforceSalesBasedOnInventory: true,
        });
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'globalSettings/fetch/pending',
            payload: {
                id: 'global-settings-id',
                enforceSalesBasedOnInventory: true,
            },
        });
    });

    it('dispatches reset datastore when reset button is pressed', () => {
        const { getByTestId } = render(<Settings />);

        fireEvent.press(getByTestId('settings-reset-data-button'));

        expect(mockResetDataStore).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'settings/reset/pending',
        });
    });
});
