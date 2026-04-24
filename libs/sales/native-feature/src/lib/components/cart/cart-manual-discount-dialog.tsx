import React from 'react';
import { Text, TextInput, View, Pressable, ScrollView } from 'react-native';
import { Button, Dialog } from '@rneui/themed';
import { CartStyles } from './cart.styles';
import { ManualDraft } from './cart.types';
import { translateWithFallback } from '@pos/shared/utils';

interface CartManualDiscountDialogProps {
    visible: boolean;
    styles: CartStyles;
    overlayStyle: object;
    draft: ManualDraft;
    availableDefinitions: Array<{
        id: string;
        name: string;
        method: 'PERCENT' | 'AMOUNT';
        value: number;
        scope: 'LINE' | 'ORDER';
    }>;
    approvalTargetName: string;
    baseAmount: number;
    placeholderTextColor: string;
    onClose: () => void;
    onSubmit: () => void;
    onSelectDefinition: (definitionId: string) => void;
    onChange: (updater: (current: ManualDraft) => ManualDraft) => void;
}

export function CartManualDiscountDialog({
    visible,
    styles,
    overlayStyle,
    draft,
    availableDefinitions,
    approvalTargetName,
    baseAmount,
    placeholderTextColor,
    onClose,
    onSubmit,
    onSelectDefinition,
    onChange,
}: CartManualDiscountDialogProps) {
    const t = translateWithFallback;
    return (
        <Dialog
            isVisible={visible}
            onBackdropPress={onClose}
            supportedOrientations={['landscape']}
            presentationStyle="fullScreen"
            overlayStyle={overlayStyle}
        >
            <ScrollView
                style={styles.manualDiscountDialogScroll}
                contentContainerStyle={styles.manualDiscountDialogScrollContent}
                showsVerticalScrollIndicator
                bounces={false}
                testID="manual-discount-dialog-scroll"
            >
                <View style={styles.dialogHeroCard}>
                    <Text style={styles.dialogTitle}>
                        {t('SALES_ManualDiscount', 'Manual discount')}
                    </Text>
                    <Text style={styles.dialogHint}>
                        {t(
                            'SALES_ManualDiscountHint',
                            'Apply a one-time line or order discount to the current sale.'
                        )}
                    </Text>
                    <View style={styles.dialogHeroMetaRow}>
                        <View style={styles.dialogHeroPill}>
                            <Text style={styles.dialogHeroPillText}>
                                {draft.scope === 'LINE'
                                    ? t('SALES_LineDiscount', 'Line discount')
                                    : t('SALES_OrderDiscount', 'Order discount')}
                            </Text>
                        </View>
                        <View style={styles.dialogHeroPill}>
                            <Text style={styles.dialogHeroPillText}>
                                Base ${baseAmount.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.segmentRow}>
                    {(['LINE', 'ORDER'] as const).map((scope) => (
                        <Pressable
                            key={scope}
                            style={[
                                styles.segmentButton,
                                draft.scope === scope && styles.segmentButtonActive,
                            ]}
                            onPress={() =>
                                onChange((current) => ({
                                    ...current,
                                    scope,
                                    selectedDefinitionId: undefined,
                                }))
                            }
                        >
                            <Text
                                style={[
                                    styles.segmentButtonText,
                                    draft.scope === scope && styles.segmentButtonTextActive,
                                ]}
                            >
                                {scope === 'LINE'
                                    ? t('SALES_Line', 'Line')
                                    : t('SALES_Order', 'Order')}
                            </Text>
                        </Pressable>
                    ))}
                </View>
                <View style={styles.segmentRow}>
                    {(['PERCENT', 'AMOUNT'] as const).map((method) => (
                        <Pressable
                            key={method}
                            style={[
                                styles.segmentButton,
                                draft.method === method && styles.segmentButtonActive,
                            ]}
                            onPress={() =>
                                onChange((current) => ({
                                    ...current,
                                    method,
                                    selectedDefinitionId: undefined,
                                }))
                            }
                        >
                            <Text
                                style={[
                                    styles.segmentButtonText,
                                    draft.method === method && styles.segmentButtonTextActive,
                                ]}
                            >
                                {method === 'PERCENT'
                                    ? t('COMMON_Percent', 'Percent')
                                    : t('COMMON_Amount', 'Amount')}
                            </Text>
                        </Pressable>
                    ))}
                </View>
                {availableDefinitions.length ? (
                    <View style={styles.savedDiscountCard}>
                        <Text style={styles.dialogSubheading}>
                            {t('SALES_SavedManualDiscounts', 'Saved manual discounts')}
                        </Text>
                        <Text style={styles.dialogFieldHint}>
                            {t(
                                'SALES_SavedManualDiscountsHint',
                                'Choose a saved manual rule or keep using a one-time entry below.'
                            )}
                        </Text>
                        <View style={styles.savedDiscountList}>
                            {availableDefinitions.map((definition) => (
                                <Pressable
                                    key={definition.id}
                                    style={[
                                        styles.savedDiscountButton,
                                        draft.selectedDefinitionId === definition.id &&
                                            styles.savedDiscountButtonActive,
                                    ]}
                                    onPress={() => onSelectDefinition(definition.id)}
                                >
                                    <Text
                                        style={[
                                            styles.savedDiscountButtonTitle,
                                            draft.selectedDefinitionId === definition.id &&
                                                styles.savedDiscountButtonTitleActive,
                                        ]}
                                    >
                                        {definition.name}
                                    </Text>
                                    <Text style={styles.savedDiscountButtonMeta}>
                                        {definition.method === 'PERCENT'
                                            ? `${definition.value}%`
                                            : `$${definition.value.toFixed(2)}`}{' '}
                                        · {definition.scope === 'LINE'
                                            ? t('SALES_Line', 'Line')
                                            : t('SALES_Order', 'Order')}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                ) : null}
                <View style={styles.manualValueCard}>
                    <Text style={styles.dialogSubheading}>
                        {draft.method === 'PERCENT'
                            ? t('SALES_DiscountPercent', 'Discount percent')
                            : t('SALES_DiscountAmount', 'Discount amount')}
                    </Text>
                    <Text style={styles.dialogFieldHint}>
                        {draft.method === 'PERCENT'
                            ? t(
                                  'SALES_DiscountPercentHint',
                                  'Enter only the percent to take off {{target}}.',
                                  { target: approvalTargetName }
                              )
                            : t(
                                  'SALES_DiscountAmountHint',
                                  'Enter only the dollar amount to take off {{target}}.',
                                  { target: approvalTargetName }
                              )}
                    </Text>
                    <TextInput
                        value={draft.method === 'PERCENT' ? draft.percentValue : draft.amountValue}
                        onChangeText={(nextValue) =>
                            onChange((current) => ({
                                ...current,
                                selectedDefinitionId: undefined,
                                percentValue:
                                    current.method === 'PERCENT'
                                        ? nextValue
                                        : current.percentValue,
                                amountValue:
                                    current.method === 'AMOUNT'
                                        ? nextValue
                                        : current.amountValue,
                            }))
                        }
                        placeholder="0"
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
            </ScrollView>
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
