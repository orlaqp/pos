import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, Button } from '@rneui/themed';
import { StyleSheet, Text, View } from 'react-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { OrderEntity, OrderService } from '@pos/orders/data-access';
import { UIOrderSummaryPanel, UISpinner } from '@pos/shared/ui-native';
import { translateWithFallback } from '../../../../../../shared/utils/src/lib/translation';
import { OrderRefund } from '@pos/shared/models';
import {
    buildDiscountBreakdownFromOrder,
    buildOrderSummaryFromOrder,
    buildRefundedOrderDetailsSummary,
} from './order-refunded-details.logic';

interface OrderRefundedDetailsDialogProps {
    visible: boolean;
    order?: OrderEntity;
    onClose: () => void;
}

export function OrderRefundedDetailsDialog({
    visible,
    order,
    onClose,
}: OrderRefundedDetailsDialogProps) {
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const t = translateWithFallback;
    const [refunds, setRefunds] = useState<OrderRefund[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;

        if (!visible || !order?.id) {
            setRefunds([]);
            setLoading(false);
            return () => {
                cancelled = true;
            };
        }

        setLoading(true);
        OrderService.getRefundRecordsForOrder(order.id)
            .then((result) => {
                if (cancelled) return;
                setRefunds(result || []);
            })
            .catch(() => {
                if (cancelled) return;
                setRefunds([]);
            })
            .finally(() => {
                if (cancelled) return;
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [order?.id, visible]);

    const orderSummary = useMemo(
        () => (order ? buildOrderSummaryFromOrder(order) : undefined),
        [order],
    );
    const discountBreakdown = useMemo(
        () => (order ? buildDiscountBreakdownFromOrder(order) : []),
        [order],
    );
    const refundSummary = useMemo(
        () =>
            order
                ? buildRefundedOrderDetailsSummary(order, refunds)
                : undefined,
        [order, refunds],
    );

    return (
        <Dialog
            isVisible={visible}
            onBackdropPress={onClose}
            supportedOrientations={['landscape']}
            presentationStyle="overFullScreen"
            overlayStyle={[styles.overlay, { width: 1120, maxWidth: '94%' }]}
        >
            {!order || !orderSummary ? null : (
                <View
                    style={styles.container}
                    testID="order-refunded-details-dialog"
                >
                    <UIOrderSummaryPanel
                        orderSummary={orderSummary}
                        discountBreakdown={discountBreakdown}
                        title={t(
                            'ORDERS_RefundedOrderDetailsTitle',
                            'Refunded order details',
                        )}
                        hint={t(
                            'ORDERS_RefundedOrderDetailsHint',
                            'Review the original sale and its refund summary.',
                        )}
                        footer={
                            <View style={styles.footer}>
                                <View style={styles.footerSummary}>
                                    <Text style={styles.footerLabel}>
                                        {t(
                                            'ORDERS_RefundedOrderDetailsTotal',
                                            'Original total',
                                        )}
                                    </Text>
                                    <Text style={styles.footerValue}>
                                        ${Number(order.total || 0).toFixed(2)}
                                    </Text>
                                </View>
                                <Button
                                    testID="order-refunded-details-close-button"
                                    title={t('COMMON_Close', 'Close')}
                                    type="solid"
                                    onPress={onClose}
                                    buttonStyle={styles.closeButton}
                                />
                            </View>
                        }
                    />
                    <View
                        style={styles.refundCard}
                        testID="order-refunded-details-refund-card"
                    >
                        <Text style={styles.refundTitle}>
                            {t(
                                'ORDERS_RefundedOrderDetailsRefundSummary',
                                'Refund summary',
                            )}
                        </Text>
                        {loading ? (
                            <UISpinner
                                size="small"
                                message={t('COMMON_Loading', 'Loading...')}
                            />
                        ) : (
                            <>
                                <View
                                    style={styles.refundMetaGrid}
                                    testID="order-refunded-details-meta-grid"
                                >
                                    <View style={styles.refundMetaItem}>
                                        <Text style={styles.refundMetaLabel}>
                                            {t(
                                                'ORDERSTATUS_Refunded',
                                                'REFUNDED',
                                            )}
                                        </Text>
                                        <Text style={styles.refundMetaValue}>
                                            {t(
                                                'ORDERS_RefundedOrderDetailsStatusValue',
                                                'Fully refunded',
                                            )}
                                        </Text>
                                    </View>
                                    <View style={styles.refundMetaItem}>
                                        <Text style={styles.refundMetaLabel}>
                                            {t(
                                                'ORDERS_RefundedOrderDetailsRefundedBy',
                                                'Refunded by',
                                            )}
                                        </Text>
                                        <Text style={styles.refundMetaValue}>
                                            {refundSummary?.latestRefundedBy ||
                                                t(
                                                    'COMMON_NotAvailableShort',
                                                    'N/A',
                                                )}
                                        </Text>
                                    </View>
                                    <View style={styles.refundMetaItem}>
                                        <Text style={styles.refundMetaLabel}>
                                            {t(
                                                'ORDERS_RefundedOrderDetailsRefundDate',
                                                'Refund date',
                                            )}
                                        </Text>
                                        <Text style={styles.refundMetaValue}>
                                            {refundSummary?.latestRefundDate
                                                ? new Date(
                                                      refundSummary.latestRefundDate,
                                                  ).toLocaleString()
                                                : t(
                                                      'COMMON_NotAvailableShort',
                                                      'N/A',
                                                  )}
                                        </Text>
                                    </View>
                                    <View style={styles.refundMetaItem}>
                                        <Text style={styles.refundMetaLabel}>
                                            {t(
                                                'ORDERS_RefundedOrderDetailsRefundAmount',
                                                'Refund amount',
                                            )}
                                        </Text>
                                        <Text style={styles.refundMetaValue}>
                                            $
                                            {Number(
                                                refundSummary?.totalRefundAmount ||
                                                    0,
                                            ).toFixed(2)}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.refundPaymentsWrap}>
                                    <Text style={styles.refundPaymentsTitle}>
                                        {t(
                                            'ORDERS_RefundedOrderDetailsRefundPayments',
                                            'Refund payments',
                                        )}
                                    </Text>
                                    {refundSummary?.refundPayments?.length ? (
                                        refundSummary.refundPayments.map(
                                            (payment, index) => (
                                                <View
                                                    key={`${payment.type}-${index}`}
                                                    style={styles.paymentRow}
                                                    testID={`order-refunded-details-payment-${index}`}
                                                >
                                                    <Text
                                                        style={
                                                            styles.paymentType
                                                        }
                                                    >
                                                        {String(
                                                            payment.type || '',
                                                        ).toUpperCase()}
                                                    </Text>
                                                    <Text
                                                        style={
                                                            styles.paymentAmount
                                                        }
                                                    >
                                                        $
                                                        {Number(
                                                            payment.amount || 0,
                                                        ).toFixed(2)}
                                                    </Text>
                                                </View>
                                            ),
                                        )
                                    ) : (
                                        <Text style={styles.paymentEmpty}>
                                            {t(
                                                'ORDERS_RefundedOrderDetailsNoRefundPayments',
                                                'No refund payment breakdown available.',
                                            )}
                                        </Text>
                                    )}
                                </View>
                            </>
                        )}
                    </View>
                </View>
            )}
        </Dialog>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        overlay: {
            backgroundColor: tokens.colors.canvas,
            borderColor: tokens.colors.border,
            borderWidth: 1,
            borderRadius: 5,
            padding: tokens.spacing.md,
        },
        container: {
            flexDirection: 'row',
            gap: tokens.spacing.md,
            minHeight: 640,
        },
        refundCard: {
            width: 320,
            borderRadius: tokens.radii.lg,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.surfaceMuted,
            padding: tokens.spacing.md,
        },
        refundTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 18,
            fontWeight: '800',
            marginBottom: tokens.spacing.md,
        },
        refundMetaGrid: {
            gap: tokens.spacing.sm,
        },
        refundMetaItem: {
            borderRadius: tokens.radii.md,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.surface,
            padding: tokens.spacing.sm,
        },
        refundMetaLabel: {
            color: tokens.colors.textMuted,
            fontSize: 11,
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 4,
        },
        refundMetaValue: {
            color: tokens.colors.textPrimary,
            fontSize: 14,
            fontWeight: '700',
        },
        refundPaymentsWrap: {
            marginTop: tokens.spacing.md,
            borderRadius: tokens.radii.md,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.surface,
            padding: tokens.spacing.sm,
        },
        refundPaymentsTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 14,
            fontWeight: '800',
            marginBottom: tokens.spacing.xs,
        },
        paymentRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 6,
            borderTopWidth: 1,
            borderTopColor: tokens.colors.border,
        },
        paymentType: {
            color: tokens.colors.textSecondary,
            fontSize: 13,
            fontWeight: '700',
        },
        paymentAmount: {
            color: tokens.colors.textPrimary,
            fontSize: 13,
            fontWeight: '800',
        },
        paymentEmpty: {
            color: tokens.colors.textSecondary,
            fontSize: 13,
        },
        footer: {
            marginTop: tokens.spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: tokens.spacing.md,
        },
        footerSummary: {
            flex: 1,
        },
        footerLabel: {
            color: tokens.colors.textSecondary,
            fontSize: 12,
            fontWeight: '700',
        },
        footerValue: {
            color: tokens.colors.textPrimary,
            fontSize: 20,
            fontWeight: '800',
            marginTop: 4,
        },
        closeButton: {
            borderRadius: tokens.radii.md,
            paddingHorizontal: tokens.spacing.lg,
            minHeight: 46,
            backgroundColor: tokens.colors.accent,
        },
    });

export default OrderRefundedDetailsDialog;
