import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button, Dialog } from '@rneui/themed';
import { CartStyles } from './cart.styles';

interface CartPromoDialogProps {
    visible: boolean;
    styles: CartStyles;
    overlayStyle: object;
    promoCodeInput: string;
    placeholderTextColor: string;
    onChangePromoCode: (value: string) => void;
    onClose: () => void;
    onSubmit: () => void;
}

export function CartPromoDialog({
    visible,
    styles,
    overlayStyle,
    promoCodeInput,
    placeholderTextColor,
    onChangePromoCode,
    onClose,
    onSubmit,
}: CartPromoDialogProps) {
    return (
        <Dialog
            isVisible={visible}
            onBackdropPress={onClose}
            supportedOrientations={['landscape']}
            presentationStyle="fullScreen"
            overlayStyle={overlayStyle}
        >
            <Text style={styles.dialogTitle}>Apply promo code</Text>
            <Text style={styles.dialogHint}>
                Promo codes recalculate the cart immediately.
            </Text>
            <TextInput
                value={promoCodeInput}
                onChangeText={onChangePromoCode}
                placeholder="SPRING10"
                placeholderTextColor={placeholderTextColor}
                autoCapitalize="characters"
                style={styles.dialogInput}
            />
            <View style={styles.dialogActionRow}>
                <Button type="clear" title="Cancel" onPress={onClose} />
                <Button title="Apply" onPress={onSubmit} />
            </View>
        </Dialog>
    );
}
