import React, { useRef, useState } from 'react';

import { StyleSheet, View, Text, Alert } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import { InventoryReceiveLineDTO } from '@pos/inventory/data-access';
import { TextInput } from 'react-native-gesture-handler';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { translateWithFallback } from '@pos/shared/utils';

export interface InventoryReceiveLineProps {
    readOnly: boolean;
    item: InventoryReceiveLineDTO;
    onUpdate: (item: InventoryReceiveLineDTO) => void;
    onDelete: (item: InventoryReceiveLineDTO) => void;
}

const toTestKey = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export function InventoryReceiveLine({
    readOnly,
    item,
    onUpdate,
    onDelete,
}: InventoryReceiveLineProps) {
    const t = translateWithFallback;
    const theme = useTheme();
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const local = useStyles(tokens);
    const [received, setReceived] = useState<string>(item.received.toString());
    const [comment, setComment] = useState<string | undefined>(
        item.comments || undefined
    );
    const receivedRef = useRef<string>(item.received.toString());
    const productKey = toTestKey(item.productName);
    
    const originalReceived = item.received;
    const beforeQuantity = Number(item.current || 0);
    const receivedQuantity = Number(item.received || 0);
    const afterQuantity = beforeQuantity + receivedQuantity;
    const beforeLabel = t('INVENTORY_Before', 'Before');
    const afterLabel = t('INVENTORY_After', 'After');

    const formatQuantity = (value: number) =>
        Number.isInteger(value) ? `${value}` : value.toFixed(2);

    const confirmDeletion = () => {
        Alert.alert(
            t('COMMON_AreYouSure', 'Are you sure?'),
            t(
                'COMMON_UndoOperationWarning',
                'You will not be able to undo this operation'
            ),
            [
                { text: t('COMMON_No', 'No') },
                { text: t('COMMON_Yes', 'Yes'), onPress: () => onDelete(item) },
            ]
        );
    };

    const updateReceived = (received: string) => {
        const validatedReceive = received || originalReceived?.toString();
        receivedRef.current = validatedReceive;
        setReceived(validatedReceive);
        onUpdate({ ...item, received: +validatedReceive });
    };

    const updateComment = (comments: string) => {
        setComment(comments);
        onUpdate({ ...item, comments });
    };

    return (
        <View style={[local.row, readOnly && local.readOnlyRow]}>
            <View style={local.productColumn}>
                <Text style={local.productName}>{item.productName}</Text>
                <Text style={local.productMeta}>
                    {readOnly
                        ? `${beforeLabel}: ${formatQuantity(beforeQuantity)} • ${afterLabel}: ${formatQuantity(afterQuantity)}`
                        : t('INVENTORY_ReceivingQuantity', 'Receiving quantity')}
                </Text>
            </View>
            <View style={local.quantityColumn}>
                <Text style={local.inputLabel}>
                    {readOnly
                        ? t('INVENTORY_Received', 'Received')
                        : t('INVENTORY_Received', 'Received')}
                </Text>
                {readOnly ? (
                    <Text style={local.readOnlyValue}>
                        {formatQuantity(receivedQuantity)}
                    </Text>
                ) : (
                    <TextInput
                        testID={`inventory-receive-qty-${productKey}`}
                        value={received}
                        onChangeText={(value) => {
                            receivedRef.current = value;
                            setReceived(value);
                            if (!value) return;

                            const parsed = +value;
                            if (Number.isNaN(parsed)) return;
                            onUpdate({ ...item, received: parsed });
                        }}
                        style={[
                            styles.input, styles.primaryText,
                            local.input,
                        ]}
                        onFocus={() => {
                            receivedRef.current = '';
                            setReceived('');
                            onUpdate({ ...item, received: 0 });
                        }}
                        onBlur={() => updateReceived(receivedRef.current)}
                        editable={!readOnly}
                    />
                )}
            </View>
            <View style={local.commentColumn}>
                <Text style={local.inputLabel}>
                    {readOnly
                        ? t('INVENTORY_After', 'After')
                        : t('COMMON_Comments', 'Comments')}
                </Text>
                {readOnly ? (
                    <Text style={local.readOnlyValue}>
                        {formatQuantity(afterQuantity)}
                    </Text>
                ) : (
                    <TextInput
                        value={comment}
                        onChangeText={setComment}
                        onBlur={() => updateComment(comment || '')}
                        style={[styles.input, styles.primaryText, local.input]}
                        editable={!readOnly}
                    />
                )}
            </View>
            { !readOnly &&
            <View style={local.actionsColumn}>
                <Button
                    type="clear"
                    icon={{
                        name: 'trash-can',
                        type: 'material-community',
                        color: theme.theme.colors.error,
                    }}
                    onPress={confirmDeletion}
                />
            </View>
            }
        </View>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        row: {
            alignItems: 'center',
            backgroundColor: '#0B1119',
            borderColor: '#1D2A3B',
            borderRadius: 18,
            borderWidth: 1,
            flexDirection: 'row',
            marginBottom: tokens.spacing.sm,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.sm,
        },
        readOnlyRow: {
            opacity: 0.78,
        },
        productColumn: {
            flex: 4,
            paddingRight: tokens.spacing.md,
        },
        productName: {
            color: tokens.colors.textPrimary,
            fontSize: 16,
            fontWeight: '800',
        },
        productMeta: {
            color: tokens.colors.textMuted,
            fontSize: 12,
            fontWeight: '700',
            marginTop: 4,
        },
        quantityColumn: {
            flex: 1.2,
            paddingRight: tokens.spacing.sm,
        },
        commentColumn: {
            flex: 3,
            paddingRight: tokens.spacing.sm,
        },
        inputLabel: {
            color: tokens.colors.textMuted,
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 0.8,
            marginBottom: 4,
            textTransform: 'uppercase',
        },
        input: {
            backgroundColor: '#111923',
            borderColor: '#26364C',
            borderRadius: 14,
            borderWidth: 1,
            marginRight: 0,
            paddingHorizontal: tokens.spacing.sm,
        },
        readOnlyValue: {
            color: tokens.colors.textPrimary,
            fontSize: 15,
            fontWeight: '800',
            minHeight: 28,
            paddingVertical: 6,
        },
        actionsColumn: {
            flex: 0.8,
            flexDirection: 'row',
            justifyContent: 'flex-end',
        },
    });

export default InventoryReceiveLine;
