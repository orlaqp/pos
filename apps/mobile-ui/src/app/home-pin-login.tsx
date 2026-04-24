import React from 'react';
import { Image, ImageSourcePropType, Pressable, View } from 'react-native';
import { Text } from '@rneui/themed';
import { UIAlert, UIKeyPad } from '@pos/shared/ui-native';
import { translateWithFallback } from '@pos/shared/utils';
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
    const t = translateWithFallback;

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
                <View style={styles.pinHeroTop}>
                    <View style={styles.pinBrandPlate}>
                        <Image source={brandMark} style={styles.brandMark} resizeMode="contain" />
                    </View>
                    <View style={styles.pinHeroGlow} />
                </View>
                <View style={styles.pinHeroBottom}>
                    <Text style={styles.businessLabel}>
                        {businessName || t('HOME_BusinessWorkspace', 'Business workspace')}
                    </Text>
                    <Text style={styles.heroTitle}>
                        {t('HOME_EmployeePinTitle', 'Employee PIN')}
                    </Text>
                    <Text style={styles.heroSubtitle}>
                        {t(
                            'HOME_EmployeePinSubtitle',
                            'Admin session is active for {{target}}. Enter a staff PIN to continue into the operational app.',
                            { target: userEmail || t('HOME_ThisDevice', 'this device') }
                        )}
                    </Text>
                    <View style={styles.pinHeroMetaRow}>
                        <View style={styles.pinHeroMetaChip}>
                            <Text style={styles.pinHeroMetaLabel}>
                                {t('HOME_PinAccessLabel', 'Access')}
                            </Text>
                            <Text style={styles.pinHeroMetaValue}>
                                {t('HOME_PinAccessValue', 'Shared device')}
                            </Text>
                        </View>
                        <View style={styles.pinHeroMetaChip}>
                            <Text style={styles.pinHeroMetaLabel}>
                                {t('HOME_PinModeLabel', 'Mode')}
                            </Text>
                            <Text style={styles.pinHeroMetaValue}>
                                {t('HOME_PinModeValue', 'PIN required')}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.keypadCard}>
                <View style={styles.keypadHeader}>
                    <Text style={styles.keypadEyebrow}>
                        {t('HOME_StaffAccessEyebrow', 'Staff access')}
                    </Text>
                    <Text style={styles.keypadTitle}>
                        {t('HOME_SharedDeviceAccessTitle', 'Shared device access')}
                    </Text>
                    <Text style={styles.keypadHint}>
                        {t(
                            'HOME_SharedDeviceAccessHint',
                            'PIN is required every time the app is reopened.'
                        )}
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
                    <Text style={styles.pinUtilityTitle}>
                        {t('HOME_DeviceSessionTitle', 'Device session')}
                    </Text>
                {onLogoff ? (
                    <Pressable
                        testID="home-pin-logoff-button"
                        onPress={onLogoff}
                        style={styles.pinLogoffButton}
                    >
                        <Text style={styles.pinLogoffButtonText}>
                            {t('HOME_LogoffBusinessButton', 'Log off business')}
                        </Text>
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
                                        {t(
                                            'HOME_RemoveSavedLoginButton',
                                            'Remove saved login from this device'
                                        )}
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
                                        {t(
                                            'HOME_ViewAppDiagnosticsButton',
                                            'View app diagnostics on this device'
                                        )}
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
