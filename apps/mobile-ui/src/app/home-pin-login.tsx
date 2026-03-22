import React from 'react';
import { Image, ImageSourcePropType, View } from 'react-native';
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
}: HomePinLoginProps) {
    return (
        <View style={styles.shell}>
            <View style={styles.hero}>
                <Image source={brandMark} style={styles.brandMark} resizeMode="contain" />
                <Text style={styles.businessLabel}>{businessName || 'Business workspace'}</Text>
                <Text style={styles.heroTitle}>Employee PIN</Text>
                <Text style={styles.heroSubtitle}>
                    Admin session is active for {userEmail || 'this device'}. Enter a staff PIN to
                    continue into the operational app.
                </Text>
            </View>
            <View style={styles.keypadCard}>
                <Text style={styles.keypadTitle}>Shared device access</Text>
                <Text style={styles.keypadHint}>
                    PIN is required every time the app is reopened.
                </Text>
                {pinLockMessage ? <UIAlert message={pinLockMessage} type="error" /> : null}
                {pinAttemptsMessage ? (
                    <UIAlert message={pinAttemptsMessage} type="warning" />
                ) : null}
                <UIKeyPad
                    initialValue={pin}
                    onChange={onPinUpdated}
                    invalidAttempt={invalidPinAttempt}
                    resetToken={pinResetToken}
                    disabled={isPinLocked}
                />
            </View>
        </View>
    );
}
