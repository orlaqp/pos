import React from 'react';
import { Text, View } from 'react-native';
import { translateWithFallback } from '@pos/shared/utils';
import type { CartStyles } from './cart.styles';

interface CartTaxTotalsProps {
    styles: CartStyles;
    subtotal?: number | null;
    tax?: number | null;
    total?: number | null;
    taxValue?: number | null;
}

const isPositiveFinite = (value?: number | null): value is number =>
    typeof value === 'number' && Number.isFinite(value) && value > 0;

const formatCurrency = (value?: number | null) =>
    `$${(Number.isFinite(value) ? Number(value) : 0).toFixed(2)}`;

const formatTaxLabel = (taxValue?: number | null) => {
    const t = translateWithFallback;

    if (!isPositiveFinite(taxValue)) {
        return t('CART_Tax', 'Tax');
    }

    return t('CART_TaxWithRate', 'Tax ({{rate}}%)', {
        rate: String(taxValue),
    });
};

export function CartTaxTotals({
    styles,
    subtotal,
    tax,
    total,
    taxValue,
}: CartTaxTotalsProps) {
    const t = translateWithFallback;

    if (!isPositiveFinite(tax)) {
        return null;
    }

    return (
        <View testID="cart-tax-totals" style={styles.taxTotalsCard}>
            <View style={styles.taxTotalsRow}>
                <Text style={styles.taxTotalsLabel}>
                    {t('COMMON_Subtotal', 'Subtotal')}
                </Text>
                <Text style={styles.taxTotalsValue}>
                    {formatCurrency(subtotal)}
                </Text>
            </View>
            <View style={styles.taxTotalsRow}>
                <Text style={styles.taxTotalsLabel}>
                    {formatTaxLabel(taxValue)}
                </Text>
                <Text style={styles.taxTotalsValue}>
                    {formatCurrency(tax)}
                </Text>
            </View>
            <View style={[styles.taxTotalsRow, styles.taxTotalsRowStrong]}>
                <Text style={styles.taxTotalsLabelStrong}>
                    {t('COMMON_Total', 'Total')}
                </Text>
                <Text style={styles.taxTotalsValueStrong}>
                    {formatCurrency(total)}
                </Text>
            </View>
        </View>
    );
}

export default CartTaxTotals;
