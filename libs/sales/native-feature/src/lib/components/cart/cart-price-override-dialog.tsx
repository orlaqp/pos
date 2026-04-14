import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button, Dialog } from '@rneui/themed';
import { CartStyles } from './cart.styles';
import { OverrideDraft } from './cart.types';

interface CartPriceOverrideDialogProps {
    visible: boolean;
    styles: CartStyles;
    overlayStyle: object;
    draft: OverrideDraft;
    selectedItemName?: string;
    basePrice: number;
    placeholderTextColor: string;
    onClose: () => void;
    onSubmit: () => void;
    onChange: (updater: (current: OverrideDraft) => OverrideDraft) => void;
}

export function CartPriceOverrideDialog({
    visible,
    styles,
    overlayStyle,
    draft,
    selectedItemName,
    basePrice,
    placeholderTextColor,
    onClose,
    onSubmit,
    onChange,
}: CartPriceOverrideDialogProps) {
    return (
        <Dialog
            isVisible={visible}
            onBackdropPress={onClose}
            supportedOrientations={['landscape']}
            presentationStyle="fullScreen"
            overlayStyle={overlayStyle}
        >
            <View style={styles.dialogHeroCard}>
                <Text style={styles.dialogTitle}>Price override</Text>
                <Text style={styles.dialogHint}>
                    Override the selected line price for the current sale.
                </Text>
                <View style={styles.dialogHeroMetaRow}>
                    <View style={styles.dialogHeroPill}>
                        <Text style={styles.dialogHeroPillText}>
                            {selectedItemName || 'Selected item'}
                        </Text>
                    </View>
                    <View style={styles.dialogHeroPill}>
                        <Text style={styles.dialogHeroPillText}>
                            Base ${basePrice.toFixed(2)}
                        </Text>
                    </View>
                </View>
            </View>
            <TextInput
                value={draft.finalPrice}
                onChangeText={(finalPrice) =>
                    onChange((current) => ({
                        ...current,
                        finalPrice,
                    }))
                }
                placeholder={basePrice.toFixed(2)}
                placeholderTextColor={placeholderTextColor}
                keyboardType="decimal-pad"
                style={[styles.dialogInput, styles.dialogInputLarge]}
            />
            <TextInput
                value={draft.reasonCode}
                onChangeText={(reasonCode) =>
                    onChange((current) => ({
                        ...current,
                        reasonCode,
                    }))
                }
                placeholder="Reason code (optional)"
                placeholderTextColor={placeholderTextColor}
                style={styles.dialogInput}
            />
            <TextInput
                value={draft.reasonNote}
                onChangeText={(reasonNote) =>
                    onChange((current) => ({
                        ...current,
                        reasonNote,
                    }))
                }
                placeholder="Reason note (optional)"
                placeholderTextColor={placeholderTextColor}
                style={styles.dialogInput}
            />
            <View style={styles.dialogActionRow}>
                <Button type="clear" title="Cancel" onPress={onClose} />
                <Button title="Apply" onPress={onSubmit} />
            </View>
        </Dialog>
    );
}
