import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { HomePinLogin } from './home-pin-login';

jest.mock('@rneui/themed', () => ({
    Text: ({ children }: { children: React.ReactNode }) => {
        const { Text } = require('react-native');
        return <Text>{children}</Text>;
    },
}));

jest.mock('@pos/shared/ui-native', () => ({
    UIAlert: ({ message }: { message: string }) => {
        const { Text } = require('react-native');
        return <Text>{message}</Text>;
    },
    UIKeyPad: () => {
        const { View } = require('react-native');
        return <View testID="pin-keypad" />;
    },
}));

describe('HomePinLogin', () => {
    const styles = {
        shell: {},
        e2eShortcut: {},
        hero: {},
        brandMark: {},
        businessLabel: {},
        heroTitle: {},
        heroSubtitle: {},
        pinHeroMetaRow: {},
        pinHeroMetaChip: {},
        pinHeroMetaLabel: {},
        pinHeroMetaValue: {},
        keypadCard: {},
        keypadHeader: {},
        keypadEyebrow: {},
        keypadTitle: {},
        keypadHint: {},
        keypadWrap: {},
        pinUtilityPanel: {},
        pinUtilityTitle: {},
        pinLogoffButton: {},
        pinLogoffButtonText: {},
        pinStatusPanel: {},
        savedLoginStatusText: {},
        secondaryDeviceActionsPanel: {},
        secondaryDeviceActionButton: {},
        secondaryDeviceActionButtonText: {},
    } as any;

    it('renders the keypad, status copy, and secondary device actions', () => {
        const onLogoff = jest.fn();
        const onRemoveSavedLogin = jest.fn();
        const onOpenAppDiagnostics = jest.fn();

        const { getByTestId, getByText } = render(
            <HomePinLogin
                brandMark={1 as any}
                businessName="Test Business"
                userEmail="owner@example.com"
                pin=""
                pinLockMessage={null}
                pinAttemptsMessage="2 attempts remaining"
                invalidPinAttempt={0}
                pinResetToken={0}
                isPinLocked={false}
                styles={styles}
                onPinUpdated={(next) => next}
                onLogoff={onLogoff}
                savedLoginStatusLabel="Saved login enabled"
                pendingOrderStatusLabel="Pending orders remain on this device"
                onRemoveSavedLogin={onRemoveSavedLogin}
                onOpenAppDiagnostics={onOpenAppDiagnostics}
            />
        );

        expect(getByTestId('pin-keypad')).toBeTruthy();
        expect(getByText('Shared device')).toBeTruthy();
        expect(getByText('PIN required')).toBeTruthy();
        expect(getByText('Saved login enabled')).toBeTruthy();
        expect(getByText('Pending orders remain on this device')).toBeTruthy();

        fireEvent.press(getByTestId('home-pin-logoff-button'));
        fireEvent.press(getByTestId('home-pin-remove-saved-login-button'));
        fireEvent.press(getByTestId('home-pin-app-diagnostics-button'));

        expect(onLogoff).toHaveBeenCalled();
        expect(onRemoveSavedLogin).toHaveBeenCalled();
        expect(onOpenAppDiagnostics).toHaveBeenCalled();
    });
});
