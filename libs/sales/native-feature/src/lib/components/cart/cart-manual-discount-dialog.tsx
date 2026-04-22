import React from 'react';
import { Text, TextInput, View, Pressable } from 'react-native';
import { Button, Dialog } from '@rneui/themed';
import { CartStyles } from './cart.styles';
import { ManualDraft } from './cart.types';

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
    return (
        <Dialog
            isVisible={visible}
            onBackdropPress={onClose}
            supportedOrientations={['landscape']}
            presentationStyle="fullScreen"
            overlayStyle={overlayStyle}
        >
            <View style={styles.dialogHeroCard}>
                <Text style={styles.dialogTitle}>Manual discount</Text>
                <Text style={styles.dialogHint}>
                    Apply a one-time line or order discount to the current sale.
                </Text>
                <View style={styles.dialogHeroMetaRow}>
                    <View style={styles.dialogHeroPill}>
                        <Text style={styles.dialogHeroPillText}>
                            {draft.scope === 'LINE' ? 'Line discount' : 'Order discount'}
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
                            {scope}
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
                            {method === 'PERCENT' ? 'Percent' : 'Amount'}
                        </Text>
                    </Pressable>
                ))}
            </View>
            {availableDefinitions.length ? (
                <View style={styles.savedDiscountCard}>
                    <Text style={styles.dialogSubheading}>Saved manual discounts</Text>
                    <Text style={styles.dialogFieldHint}>
                        Choose a saved manual rule or keep using a one-time entry below.
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
                                    · {definition.scope === 'LINE' ? 'Line' : 'Order'}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            ) : null}
            <View style={styles.manualValueCard}>
                <Text style={styles.dialogSubheading}>
                    {draft.method === 'PERCENT' ? 'Discount percent' : 'Discount amount'}
                </Text>
                <Text style={styles.dialogFieldHint}>
                    {draft.method === 'PERCENT'
                        ? `Enter only the percent to take off ${approvalTargetName}.`
                        : `Enter only the dollar amount to take off ${approvalTargetName}.`}
                </Text>
                <TextInput
                    value={draft.method === 'PERCENT' ? draft.percentValue : draft.amountValue}
                    onChangeText={(nextValue) =>
                        onChange((current) => ({
                            ...current,
                            selectedDefinitionId: undefined,
                            percentValue:
                                current.method === 'PERCENT' ? nextValue : current.percentValue,
                            amountValue:
                                current.method === 'AMOUNT' ? nextValue : current.amountValue,
                        }))
                    }
                    placeholder="0"
                    placeholderTextColor={placeholderTextColor}
                    keyboardType="decimal-pad"
                    style={[styles.dialogInput, styles.dialogInputLarge]}
                />
            </View>
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
