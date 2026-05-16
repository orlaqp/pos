import React from 'react';

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { OrderEntity } from '@pos/orders/data-access';
import { useDispatch } from 'react-redux';
import { cartActions } from '@pos/sales/data-access';
import { parseOrderNoSegments } from '../order-item/order-item';
import { translateWithFallback } from '@pos/shared/utils';

export interface CompactOrderItemProps {
    item: OrderEntity;
    onSelect: () => void;
}

export function CompactOrderItem({ item, onSelect: onOpen }: CompactOrderItemProps) {
    const t = translateWithFallback;
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const local = useStyles(tokens);
    const dispatch = useDispatch();
    const parsedOrderNo = parseOrderNoSegments(item.orderNo);

    const openInCart = async () => {
        dispatch(cartActions.set({ ...item }));
        onOpen();
    };

    return (
        <TouchableOpacity style={[styles.dataRow, local.container]} onPress={openInCart}>
            <View style={local.leftBlock}>
                <Text style={local.eyebrow}>{t('COMMON_Order', 'Order')}</Text>
                <View style={local.topRow}>
                    {parsedOrderNo ? (
                        <>
                            <View style={local.chip}>
                                <Text style={local.chipText}>
                                    #{parsedOrderNo.sequence}
                                </Text>
                            </View>
                            <View style={local.chip}>
                                <Text style={local.chipText}>
                                    {parsedOrderNo.station}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <Text style={styles.primaryText}>{item.orderNo}</Text>
                    )}
                </View>
                <Text style={[styles.secondaryText, local.orderNoText]}>{item.orderNo}</Text>
            </View>
            <View style={local.metaBlock}>
                <Text style={styles.primaryText}>{item.employeeName}</Text>
                {!!item.orderDate && (
                    <Text style={[styles.secondaryText, local.metaSub]}>
                        {new Date(item.orderDate).toLocaleString()}
                    </Text>
                )}
            </View>
            <View style={local.countBlock}>
                <Text style={[styles.secondaryText, local.countText]}>
                    {t('ORDERITEM_ItemCount', '{{count}} item(s)', {
                        count: item.lines?.length || 0,
                    })}
                </Text>
            </View>
            <View style={local.totalBlock}>
                <Text style={[styles.name, local.totalText]}>
                    {`$ ${item.total.toFixed(2)}`}
                </Text>
                <Text style={[styles.secondaryText, local.resumeText]}>
                    {t('ORDERS_TapToResume', 'Tap to resume')}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        container: {
            borderRadius: 22,
            borderWidth: 1,
            borderColor: '#C7D0DB22',
            backgroundColor: '#0E141C',
            marginBottom: tokens.spacing.sm,
            paddingVertical: tokens.spacing.md,
            paddingHorizontal: tokens.spacing.md,
            alignItems: 'center',
        },
        leftBlock: {
            flex: 2.6,
            paddingRight: tokens.spacing.xs,
        },
        eyebrow: {
            color: tokens.colors.textMuted,
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            marginBottom: 4,
        },
        topRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        chip: {
            borderRadius: 12,
            borderWidth: 1,
            borderColor: `${tokens.colors.accent}66`,
            backgroundColor: `${tokens.colors.accent}1f`,
            paddingHorizontal: 8,
            paddingVertical: 4,
            marginRight: 6,
        },
        chipText: {
            color: tokens.colors.accent,
            fontSize: 11,
            fontWeight: '700',
        },
        orderNoText: {
            marginTop: 6,
            fontSize: 12,
        },
        metaBlock: {
            flex: 2,
            paddingHorizontal: tokens.spacing.xs,
        },
        metaSub: {
            marginTop: 2,
            fontSize: 12,
        },
        countBlock: {
            flex: 1,
            alignItems: 'center',
        },
        countText: {
            fontSize: 12,
            fontWeight: '700',
            color: tokens.colors.textMuted,
        },
        totalBlock: {
            flex: 1.3,
            alignItems: 'flex-end',
        },
        totalText: {
            textAlign: 'right',
            marginBottom: 0,
            fontSize: 20,
            fontWeight: '800',
        },
        resumeText: {
            fontSize: 11,
            color: tokens.colors.accent,
            marginTop: 4,
            fontWeight: '700',
        },
    });

export default CompactOrderItem;
