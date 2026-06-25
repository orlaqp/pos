/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Alert } from 'react-native';

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
const mockSelectLoginEmployee = jest.fn();

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

const mockLoginEmployee = {
    id: 'employee-1',
    roles: ['Admin'],
};

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: jest.fn((selector) =>
        selector === mockSelectLoginEmployee ? mockLoginEmployee : mockSettingsState
    ),
}));

jest.mock('@pos/store', () => ({
    useAppDispatch: () => mockDispatch,
}));

jest.mock('react-native-device-info', () => ({
    getVersion: () => mockGetVersion(),
    getBuildNumber: () => mockGetBuildNumber(),
}));

jest.mock('@pos/auth/data-access', () => ({
    Role: {
        Admin: 'Admin',
    },
}));

jest.mock('@pos/employees/data-access', () => ({
    selectLoginEmployee: mockSelectLoginEmployee,
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
    UIScreen: ({
        children,
        testID,
        scroll,
    }: {
        children: React.ReactNode;
        testID?: string;
        scroll?: boolean;
    }) => {
        const { View: RNView } = require('react-native');
        return (
            <RNView
                testID={testID || 'ui-screen'}
                accessibilityHint={scroll ? 'scroll-enabled' : 'scroll-disabled'}
            >
                {children}
            </RNView>
        );
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
            SETTINGS_ScaleLabelFormat: 'Scale label format:',
            SETTINGS_ScaleLabelLegacy: 'Legacy',
            SETTINGS_ScaleLabelExpanded: '5-digit price',
            SETTINGS_ScaleLabelConfirmTitle: 'Use 5-digit scale prices?',
            SETTINGS_ScaleLabelConfirmMessage:
                'Enable this only after the store scales are configured for 5-digit prices.',
            SETTINGS_Cancel: 'Cancel',
            SETTINGS_Confirm: 'Confirm',
            SETTINGS_Language: 'Language:',
            SETTINGS_English: 'English',
            SETTINGS_Spanish: 'Español',
            SETTINGS_DataManagement: 'Data Management',
            SETTINGS_ResetWarning:
                'This resets local cached data on this device. It does not delete your master business data.',
            SETTINGS_ResetData: 'Reset Data',
            SETTINGS_Status_synced: 'synced',
            SETTINGS_AppInfo: 'App Info',
            SETTINGS_Version: 'Version',
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
        mockLoginEmployee.roles = ['Admin'];
    });

    it('renders sections and labels', () => {
        const { getByTestId, getByText } = render(<Settings />);

        expect(getByTestId('settings-screen')).toBeTruthy();
        expect(getByTestId('settings-screen')).toHaveProp(
            'accessibilityHint',
            'scroll-enabled'
        );
        expect(getByText('Settings')).toBeTruthy();
        expect(getByText('Use Dark Theme:')).toBeTruthy();
        expect(getByText('Enforce Sales Based on Inventory:')).toBeTruthy();
        expect(
            getByText('Receive payment directly from Sales screen:')
        ).toBeTruthy();
        expect(getByText('Scale label format:')).toBeTruthy();
        expect(getByText('Legacy')).toBeTruthy();
        expect(getByText('5-digit price')).toBeTruthy();
        expect(getByText('Language:')).toBeTruthy();
        expect(getByText('English')).toBeTruthy();
        expect(getByText('Español')).toBeTruthy();
        expect(getByText('Reset Data')).toBeTruthy();
        expect(getByText('App Info')).toBeTruthy();
        expect(getByTestId('settings-app-version')).toHaveTextContent('2.0 (1)');
    });

    it('hides scale label format controls for non-admin employees', () => {
        mockLoginEmployee.roles = ['Sales'];

        const { queryByText } = render(<Settings />);

        expect(queryByText('Scale label format:')).toBeNull();
        expect(queryByText('5-digit price')).toBeNull();
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

    it('confirms and dispatches global settings update when expanded scale pricing is selected', () => {
        const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation();
        const { getByTestId } = render(<Settings />);

        fireEvent.press(getByTestId('settings-scale-format-expanded-button'));

        expect(alertSpy).toHaveBeenCalledWith(
            'Use 5-digit scale prices?',
            'Enable this only after the store scales are configured for 5-digit prices.',
            expect.any(Array)
        );

        const buttons = alertSpy.mock.calls[0][2] as Array<{
            text: string;
            onPress?: () => void;
        }>;
        buttons.find((button) => button.text === 'Confirm')?.onPress?.();

        expect(mockUpdateGlobalSettings).toHaveBeenCalledWith({
            id: 'global-settings-id',
            enforceSalesBasedOnInventory: false,
            scaleBarcodePriceFormat: 'EAN13_02_4_PLU_5_PRICE',
        });
        alertSpy.mockRestore();
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
