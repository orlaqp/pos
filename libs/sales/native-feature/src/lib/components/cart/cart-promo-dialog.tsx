import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button, Dialog } from '@rneui/themed';
import { CartStyles } from './cart.styles';
import { translateWithFallback } from '@pos/shared/utils';

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
                    {t('SALES_ApplyPromoCode', 'Apply promo code')}
                </Text>
                <Text style={styles.dialogHint}>
                    {t(
                        'SALES_PromoDialogHint',
                        'Enter the code exactly as provided and review the pricing update in the cart immediately.'
                    )}
                </Text>
                <View style={styles.dialogHeroMetaRow}>
                    <View style={styles.dialogHeroPill}>
                        <Text style={styles.dialogHeroPillText}>
                            {t('SALES_InstantRecalculation', 'Instant recalculation')}
                        </Text>
                    </View>
                    <View style={styles.dialogHeroPill}>
                        <Text style={styles.dialogHeroPillText}>
                            {t('SALES_CheckoutReady', 'Checkout ready')}
                        </Text>
                    </View>
                </View>
            </View>
            <View style={styles.dialogSectionCard}>
                <Text style={styles.dialogSubheading}>
                    {t('SALES_PromoCode', 'Promo code')}
                </Text>
                <Text style={styles.dialogFieldHint}>
                    {t(
                        'SALES_PromoCodeHint',
                        'Keep the code visible while the cart recalculates totals.'
                    )}
                </Text>
                <TextInput
                    value={promoCodeInput}
                    onChangeText={onChangePromoCode}
                    placeholder={t('SALES_PromoCodeExample', 'SPRING10')}
                    placeholderTextColor={placeholderTextColor}
                    autoCapitalize="characters"
                    style={[styles.dialogInput, styles.dialogInputLarge]}
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
