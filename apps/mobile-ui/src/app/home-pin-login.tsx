import React from 'react';
import { Image, ImageSourcePropType, Pressable, View } from 'react-native';
import { Text } from '@rneui/themed';
import { UIAlert, UIKeyPad } from '@pos/shared/ui-native';
import { HomeScreenStyles } from './HomeScreen.styles';

interface HomePinLoginProps {
    brandMark: ImageSourcePropType;
    businessName?: string;
    userEmail?: string | null;
    pin: string;
    pinLockMessage: string | null;
    pinAttemptsMessage: string | null;
    invalidPinAttempt: number;
    pinResetToken: number;
    isPinLocked: boolean;
    styles: HomeScreenStyles;
    onPinUpdated: (nextPin: string) => string;
    onE2EManagerLogin?: () => void;
    onLogoff?: () => void;
    savedLoginStatusLabel?: string;
    pendingOrderStatusLabel?: string;
    onRemoveSavedLogin?: () => void;
    onOpenAppDiagnostics?: () => void;
}

export function HomePinLogin({
    brandMark,
    businessName,
    userEmail,
    pin,
    pinLockMessage,
    pinAttemptsMessage,
    invalidPinAttempt,
    pinResetToken,
    isPinLocked,
    styles,
    onPinUpdated,
    onE2EManagerLogin,
    onLogoff,
    savedLoginStatusLabel,
    pendingOrderStatusLabel,
    onRemoveSavedLogin,
    onOpenAppDiagnostics,
}: HomePinLoginProps) {
    return (
        <View style={styles.shell} testID="home-pin-login-screen">
            {typeof __DEV__ !== 'undefined' && __DEV__ && onE2EManagerLogin ? (
                <Pressable
                    testID="e2e-manager-login-button"
                    onPress={onE2EManagerLogin}
                    style={styles.e2eShortcut}
                />
            ) : null}
            <View style={styles.hero}>
                <Image source={brandMark} style={styles.brandMark} resizeMode="contain" />
                <Text style={styles.businessLabel}>{businessName || 'Business workspace'}</Text>
                <Text style={styles.heroTitle}>Employee PIN</Text>
                <Text style={styles.heroSubtitle}>
                    Admin session is active for {userEmail || 'this device'}. Enter a staff PIN to
                    continue into the operational app.
                </Text>
                <View style={styles.pinHeroMetaRow}>
                    <View style={styles.pinHeroMetaChip}>
                        <Text style={styles.pinHeroMetaLabel}>Access</Text>
                        <Text style={styles.pinHeroMetaValue}>Shared device</Text>
                    </View>
                    <View style={styles.pinHeroMetaChip}>
                        <Text style={styles.pinHeroMetaLabel}>Mode</Text>
                        <Text style={styles.pinHeroMetaValue}>PIN required</Text>
                    </View>
                </View>
            </View>
            <View style={styles.keypadCard}>
                <View style={styles.keypadHeader}>
                    <Text style={styles.keypadEyebrow}>Staff access</Text>
                <Text style={styles.keypadTitle}>Shared device access</Text>
                <Text style={styles.keypadHint}>
                    PIN is required every time the app is reopened.
                </Text>
                </View>
                {pinLockMessage ? <UIAlert message={pinLockMessage} type="error" /> : null}
                {pinAttemptsMessage ? (
                    <UIAlert message={pinAttemptsMessage} type="warning" />
                ) : null}
                <View style={styles.keypadWrap}>
                <UIKeyPad
                    initialValue={pin}
                    onChange={onPinUpdated}
                    invalidAttempt={invalidPinAttempt}
                    resetToken={pinResetToken}
                    disabled={isPinLocked}
                />
                </View>
                <View style={styles.pinUtilityPanel}>
                    <Text style={styles.pinUtilityTitle}>Device session</Text>
                {onLogoff ? (
                    <Pressable
                        testID="home-pin-logoff-button"
                        onPress={onLogoff}
                        style={styles.pinLogoffButton}
                    >
                        <Text style={styles.pinLogoffButtonText}>Log off business</Text>
                    </Pressable>
                ) : null}
                    {savedLoginStatusLabel || pendingOrderStatusLabel ? (
                        <View style={styles.pinStatusPanel}>
                            {savedLoginStatusLabel ? (
                                <Text style={styles.savedLoginStatusText}>
                                    {savedLoginStatusLabel}
                                </Text>
                            ) : null}
                            {pendingOrderStatusLabel ? (
                                <Text style={styles.savedLoginStatusText}>
                                    {pendingOrderStatusLabel}
                                </Text>
                            ) : null}
                        </View>
                    ) : null}
                    {onRemoveSavedLogin || onOpenAppDiagnostics ? (
                        <View style={styles.secondaryDeviceActionsPanel}>
                            {onRemoveSavedLogin ? (
                                <Pressable
                                    testID="home-pin-remove-saved-login-button"
                                    onPress={onRemoveSavedLogin}
                                    style={styles.secondaryDeviceActionButton}
                                >
                                    <Text style={styles.secondaryDeviceActionButtonText}>
                                        Remove saved login from this device
                                    </Text>
                                </Pressable>
                            ) : null}
                            {onOpenAppDiagnostics ? (
                                <Pressable
                                    testID="home-pin-app-diagnostics-button"
                                    onPress={onOpenAppDiagnostics}
                                    style={styles.secondaryDeviceActionButton}
                                >
                                    <Text style={styles.secondaryDeviceActionButtonText}>
                                        View app diagnostics on this device
                                    </Text>
                                </Pressable>
                            ) : null}
                        </View>
                    ) : null}
                </View>
            </View>
        </View>
    );
}
