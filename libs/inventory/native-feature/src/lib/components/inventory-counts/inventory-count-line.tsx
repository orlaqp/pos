import React, { useEffect, useRef, useState } from 'react';

import { StyleSheet, View, Text, Alert } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import { InventoryCountLineDTO } from '@pos/inventory/data-access';
import { TextInput } from 'react-native-gesture-handler';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

export interface InventoryCountLineProps {
    readOnly: boolean;
    item: InventoryCountLineDTO;
    onUpdate: (item: InventoryCountLineDTO) => void;
    onDelete: (item: InventoryCountLineDTO) => void;
}

const toTestKey = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export function InventoryCountLine({
    readOnly,
    item,
    onUpdate,
    onDelete,
}: InventoryCountLineProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const local = useStyles(tokens);
    const [count, setCount] = useState<string | undefined>(item.newCount?.toString());
    const countRef = useRef<string | undefined>(item.newCount?.toString());
    const [comment, setComment] = useState<string | undefined>(
        item.comments || undefined
    );
    const productKey = toTestKey(item.productName);
    
    const originalCount = item.newCount;
    const originalComment = item.comments;

    const confirmDeletion = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [{ text: 'No' }, { text: 'Yes', onPress: () => onDelete(item) }]
        );
    };

    const updateCount = (count: string) => {
        if (!count) {
            countRef.current = originalCount?.toString();
            setCount(originalCount?.toString());
            return;
        }

        countRef.current = count;
        setCount(count);
        onUpdate({ ...item, newCount: +count });
    };
    const updateComment = (finalComment: string) => {
        if ((!originalComment && !finalComment) || originalComment === finalComment) return;

        onUpdate({ ...item, comments: finalComment });
    };

    /* eslint-disable react-hooks/set-state-in-effect -- Local draft fields intentionally resync when the selected line changes. */
    useEffect(() => {
        const nextCount = item.newCount?.toString();
        countRef.current = nextCount;
        setCount(nextCount);
        setComment(item.comments || undefined);
    }, [item.comments, item.newCount, item.productId]);
    /* eslint-enable react-hooks/set-state-in-effect */

    return (
        <View style={[local.row, readOnly && local.readOnlyRow]}>
            <View style={local.productColumn}>
                <Text style={local.productName}>{item.productName}</Text>
                <Text style={local.productMeta}>Current: {item.current.toFixed(2)}</Text>
            </View>
            <View style={local.quantityColumn}>
                <Text style={local.inputLabel}>New count</Text>
                <TextInput
                    testID={`inventory-count-qty-${productKey}`}
                    value={count}
                    onChangeText={(text) => {
                        countRef.current = text;
                        setCount(text);
                        updateCount(text);
                    }}
                    placeholder='#'
                    style={[
                        styles.input, styles.primaryText,
                        local.input,
                    ]}
                    onFocus={() => {
                        countRef.current = '';
                        setCount('');
                    }}
                    onBlur={() => updateCount(countRef.current || '')}
                    editable={!readOnly}
                />
            </View>
            <View style={local.commentColumn}>
                <Text style={local.inputLabel}>Comments</Text>
                <TextInput
                    value={comment}
                    onChangeText={setComment}
                    placeholder='comments ...'
                    onBlur={() => updateComment(comment || '')}
                    style={[styles.input, styles.primaryText, local.input]}
                    editable={!readOnly}
                />
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
        actionsColumn: {
            flex: 0.8,
            flexDirection: 'row',
            justifyContent: 'flex-end',
        },
    });

export default InventoryCountLine;
