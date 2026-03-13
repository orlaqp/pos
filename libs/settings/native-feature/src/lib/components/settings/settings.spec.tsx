/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

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
        spacing: { xxs: 2, xs: 4, md: 12, lg: 16, xl: 24 },
        radii: { lg: 14 },
        border: { default: '#445' },
        layout: { contentMaxWidth: 1200 },
        colors: {
            textPrimary: '#ffffff',
            textSecondary: '#9ba6b4',
            textMuted: '#7e8a99',
            surfaceAccent: '#2b3f5f',
            border: '#445',
        },
    }),
}));

jest.mock('@pos/shared/ui-native', () => ({
    UIScreen: ({ children, testID }: { children: React.ReactNode; testID?: string }) => {
        const { View: RNView } = require('react-native');
        return <RNView testID={testID || 'ui-screen'}>{children}</RNView>;
    },
    UIStack: ({ children }: { children: React.ReactNode }) => {
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
    }) => {
        const { Switch: RNSwitch } = require('react-native');
        return (
            <RNSwitch
                testID={testID}
                value={!!value}
                onValueChange={onValueChange}
            />
        );
    },
    Button: ({
        title,
        onPress,
        testID,
    }: {
        title?: string;
        onPress: () => void;
        testID?: string;
    }) => {
        const { Pressable: RNPressable, Text: RNText } = require('react-native');
        return (
            <RNPressable onPress={onPress} testID={testID || title}>
                <RNText>{title || 'button'}</RNText>
            </RNPressable>
        );
    },
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
