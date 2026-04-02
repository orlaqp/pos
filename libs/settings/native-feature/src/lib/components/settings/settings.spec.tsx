/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

const mockDispatch = jest.fn();
const mockUpdateTheme = jest.fn();
const mockSetThemeAction = jest.fn((payload) => ({
    type: 'settings/set',
    payload,
}));
const mockSetLanguageAction = jest.fn((payload) => ({
    type: 'settings/setLanguage',
    payload,
}));
const mockResetDataStore = jest.fn(() => ({
    type: 'settings/reset/pending',
}));
const mockUpdateGlobalSettings = jest.fn((payload) => ({
    type: 'gllbalSettings/update/pending',
    payload,
}));
const mockUpdatePayFromSalesScreen = jest.fn((payload) => ({
    type: 'settings/device/updatePayFromSalesScreen/pending',
    payload,
}));
const mockGetVersion = jest.fn(() => '2.0');
const mockGetBuildNumber = jest.fn(() => '1');

const mockSettingsState = {
    darkTheme: false,
    dataStoreStatus: 'synced',
    payFromSalesScreen: false,
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

jest.mock('@pos/store', () => ({
    useAppDispatch: () => mockDispatch,
}));

jest.mock('react-native-device-info', () => ({
    getVersion: () => mockGetVersion(),
    getBuildNumber: () => mockGetBuildNumber(),
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
    translate: (key: string) => {
        const values: Record<string, string> = {
            SETTINGS_Title: 'Settings',
            SETTINGS_Subtitle:
                'Configure app behavior and device controls.',
            SETTINGS_Preferences: 'Preferences',
            SETTINGS_UseDarkTheme: 'Use Dark Theme:',
            SETTINGS_EnforceInventory: 'Enforce Sales Based on Inventory:',
            SETTINGS_PayFromSalesScreen:
                'Receive payment directly from Sales screen:',
            SETTINGS_Language: 'Language:',
            SETTINGS_English: 'English',
            SETTINGS_Spanish: 'Español',
            SETTINGS_DataManagement: 'Data Management',
            SETTINGS_ResetWarning:
                'This resets local cached data on this device. It does not delete your master business data.',
            SETTINGS_ResetData: 'Reset Data',
            SETTINGS_Status_synced: 'synced',
        };
        return values[key] || key;
    },
    settingsActions: {
        set: (payload: boolean) => mockSetThemeAction(payload),
        setLanguage: (payload: 'en' | 'es') => mockSetLanguageAction(payload),
    },
    resetDataStore: () => mockResetDataStore(),
    fetchGlobalSettings: jest.fn(),
    updateGlobalSettings: (payload: unknown) => mockUpdateGlobalSettings(payload),
    updatePayFromSalesScreen: (payload: boolean) =>
        mockUpdatePayFromSalesScreen(payload),
}));

const { Settings } = require('./settings');

describe('Settings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSettingsState.darkTheme = false;
        mockSettingsState.dataStoreStatus = 'synced';
        mockSettingsState.payFromSalesScreen = false;
        mockSettingsState.globalSettings = {
            id: 'global-settings-id',
            enforceSalesBasedOnInventory: false,
        };
    });

    it('renders sections and labels', () => {
        const { getByTestId, getByText } = render(<Settings />);

        expect(getByTestId('settings-screen')).toBeTruthy();
        expect(getByText('Settings')).toBeTruthy();
        expect(getByText('Use Dark Theme:')).toBeTruthy();
        expect(getByText('Enforce Sales Based on Inventory:')).toBeTruthy();
        expect(
            getByText('Receive payment directly from Sales screen:')
        ).toBeTruthy();
        expect(getByText('Language:')).toBeTruthy();
        expect(getByText('English')).toBeTruthy();
        expect(getByText('Español')).toBeTruthy();
        expect(getByText('Reset Data')).toBeTruthy();
        expect(getByText('App Info')).toBeTruthy();
        expect(getByTestId('settings-app-version')).toHaveTextContent('2.0 (1)');
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

    it('dispatches global settings update when enforce inventory changes', () => {
        const { getByTestId } = render(<Settings />);

        fireEvent(
            getByTestId('settings-enforce-inventory-switch'),
            'valueChange',
            true
        );

        expect(mockUpdateGlobalSettings).toHaveBeenCalledWith({
            id: 'global-settings-id',
            enforceSalesBasedOnInventory: true,
        });
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'gllbalSettings/update/pending',
            payload: {
                id: 'global-settings-id',
                enforceSalesBasedOnInventory: true,
            },
        });
    });

    it('dispatches device settings update when pay from sales changes', () => {
        const { getByTestId } = render(<Settings />);

        fireEvent(
            getByTestId('settings-pay-from-sales-screen-switch'),
            'valueChange',
            true
        );

        expect(mockUpdatePayFromSalesScreen).toHaveBeenCalledWith(true);
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'settings/device/updatePayFromSalesScreen/pending',
            payload: true,
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

    it('dispatches language action when Spanish is selected', () => {
        const { getByTestId } = render(<Settings />);

        fireEvent.press(getByTestId('settings-language-es-button'));

        expect(mockSetLanguageAction).toHaveBeenCalledWith('es');
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'settings/setLanguage',
            payload: 'es',
        });
    });
});
