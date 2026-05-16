import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button, Dialog } from '@rneui/themed';
import { CartStyles } from './cart.styles';
import { OverrideDraft } from './cart.types';
import { translateWithFallback } from '@pos/shared/utils';

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
    const t = translateWithFallback;
    return (
        <Dialog
            isVisible={visible}
            onBackdropPress={onClose}
            supportedOrientations={['landscape']}
            presentationStyle="fullScreen"
            overlayStyle={overlayStyle}
        >
            <View style={styles.dialogHeroCard}>
                <Text style={styles.dialogTitle}>
                    {t('SALES_PriceOverride', 'Price override')}
                </Text>
                <Text style={styles.dialogHint}>
                    {t(
                        'SALES_PriceOverrideHint',
                        'Override the selected line price for the current sale.'
                    )}
                </Text>
                <View style={styles.dialogHeroMetaRow}>
                    <View style={styles.dialogHeroPill}>
                        <Text style={styles.dialogHeroPillText}>
                            {selectedItemName || t('SALES_SelectedItem', 'Selected item')}
                        </Text>
                    </View>
                    <View style={styles.dialogHeroPill}>
                        <Text style={styles.dialogHeroPillText}>
                            Base ${basePrice.toFixed(2)}
                        </Text>
                    </View>
                </View>
            </View>
            <View style={styles.dialogSectionCard}>
                <Text style={styles.dialogSubheading}>
                    {t('SALES_FinalUnitPrice', 'Final unit price')}
                </Text>
                <Text style={styles.dialogFieldHint}>
                    {t(
                        'SALES_FinalUnitPriceHint',
                        'Enter the final unit price only. Everything else in the current checkout flow stays the same.'
                    )}
                </Text>
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
            </View>
            <View style={styles.dialogSectionCard}>
                <Text style={styles.dialogSubheading}>
                    {t('SALES_ApprovalNotes', 'Approval notes')}
                </Text>
                <Text style={styles.dialogFieldHint}>
                    {t(
                        'SALES_ApprovalNotesHint',
                        'Add an optional reason code or note for manager review.'
                    )}
                </Text>
                <TextInput
                    value={draft.reasonCode}
                    onChangeText={(reasonCode) =>
                        onChange((current) => ({
                            ...current,
                            reasonCode,
                        }))
                    }
                    placeholder={t('SALES_ReasonCodeOptional', 'Reason code (optional)')}
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
                    placeholder={t('SALES_ReasonNoteOptional', 'Reason note (optional)')}
                    placeholderTextColor={placeholderTextColor}
                    style={styles.dialogInput}
                />
            </View>
            <View style={styles.dialogActionRow}>
                <Button
                    type="clear"
                    title={t('COMMON_Cancel', 'Cancel')}
                    onPress={onClose}
                    buttonStyle={styles.dialogSecondaryButton}
                    titleStyle={styles.dialogSecondaryButtonTitle}
                />
                <Button
                    title={t('COMMON_Apply', 'Apply')}
                    onPress={onSubmit}
                    buttonStyle={styles.dialogPrimaryButton}
                    titleStyle={styles.dialogPrimaryButtonTitle}
                />
            </View>
        </Dialog>
    );
}
