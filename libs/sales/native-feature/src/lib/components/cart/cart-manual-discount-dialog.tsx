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
    approvalTargetName: string;
    baseAmount: number;
    placeholderTextColor: string;
    onClose: () => void;
    onSubmit: () => void;
    onChange: (updater: (current: ManualDraft) => ManualDraft) => void;
}

export function CartManualDiscountDialog({
    visible,
    styles,
    overlayStyle,
    draft,
    approvalTargetName,
    baseAmount,
    placeholderTextColor,
    onClose,
    onSubmit,
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
                    Apply a one-off line or order discount using the current employee policy.
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
                            percentValue:
                                current.method === 'PERCENT' ? nextValue : current.percentValue,
                            amountValue:
                                current.method === 'AMOUNT' ? nextValue : current.amountValue,
                        }))
                    }
                    placeholder={draft.method === 'PERCENT' ? '10' : '5.00'}
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
            <View style={styles.approvalCard}>
                <Text style={styles.dialogSubheading}>Approval PIN if required</Text>
                <Text style={styles.dialogFieldHint}>
                    Only an employee PIN with discount approval access is needed.
                </Text>
                <TextInput
                    value={draft.approvalPin}
                    onChangeText={(approvalPin) =>
                        onChange((current) => ({
                            ...current,
                            approvalPin,
                        }))
                    }
                    placeholder="Approver PIN"
                    placeholderTextColor={placeholderTextColor}
                    keyboardType="number-pad"
                    secureTextEntry={true}
                    style={styles.dialogInput}
                />
            </View>
            <View style={styles.dialogActionRow}>
                <Button type="clear" title="Cancel" onPress={onClose} />
                <Button title="Apply" onPress={onSubmit} />
            </View>
        </Dialog>
    );
}
