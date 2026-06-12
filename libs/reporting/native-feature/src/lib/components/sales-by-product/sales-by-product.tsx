import {
    buildSalesByProductRows,
    getOrdersForStatuses,
    getRefundLinesForRefundIds,
    getRefundsForRange,
} from '@pos/reporting/data-access';
import { DateRange } from '@pos/shared/ui-native';
import { sortDescListBy } from '@pos/shared/utils';
import { useSharedStyles } from '@pos/theme/native';
import React from 'react';
import { OrderStatus } from '@pos/shared/models';
import i18next from 'i18next';

import { View } from 'react-native';
import ReportViewer, { ReportHeader } from '../report-viewer/report-viewer';

/* eslint-disable-next-line */
export interface SalesByProductProps {}

export const toSalesByProductRows = (
    rows: Array<{ productId: string; quantity: number; sales?: number; tax?: number }>,
    orders: Array<{ lines?: Array<{ productId?: string; productName?: string | null } | null> | null }>
) => {
    const productNamesById = new Map<string, string>();
    orders.forEach((order) => {
        (order.lines || []).forEach((line) => {
            if (line?.productId && line.productName && !productNamesById.has(line.productId)) {
                productNamesById.set(line.productId, line.productName);
            }
        });
    });

    const items = [...rows];
    sortDescListBy(items as any, 'quantity');

    return items.map((item) => ({
        product: productNamesById.get(item.productId) || 'Unknown',
        quantity: Number(item.quantity || 0).toFixed(2),
        tax: Number(item.tax || 0),
        sales: Number(item.sales || 0),
    }));
};

export const normalizeSalesByProductRange = (range: DateRange): DateRange => ({
    ...range,
    startDate: range.startDate.clone().startOf('day'),
    endDate: range.endDate.clone().endOf('day'),
});

export function SalesByProduct(props: SalesByProductProps) {
    const styles = useSharedStyles();
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;

    const headers: ReportHeader[] = [
        { label: t('REPORT_Header_Product', 'Product'), field: 'product', width: 4 },
        { label: t('REPORT_Header_Quantity', 'Quantity'), field: 'quantity', width: 1, align: 'right' },
        { label: t('REPORT_Header_Tax', 'Tax'), field: 'tax', width: 1, align: 'right', format: 'money', sum: true },
        { label: t('REPORT_Header_Sales', 'Sales'), field: 'sales', width: 1.5, align: 'right', format: 'money', sum: true },
    ];

    const getData = async (range: DateRange) => {
        const normalizedRange = normalizeSalesByProductRange(range);
        const [orders, refunds] = await Promise.all([
            getOrdersForStatuses({
                statuses: [OrderStatus.PAID, OrderStatus.PARTIALLY_REFUNDED],
                range: normalizedRange,
            }),
            getRefundsForRange({ range: normalizedRange }),
        ]);
        const refundLines = await getRefundLinesForRefundIds(
            refunds.map((refund) => refund.id).filter(Boolean)
        );

        return toSalesByProductRows(
            buildSalesByProductRows(orders, refundLines),
            orders
        );
    };

    return (
        <View style={styles.page}>
            <ReportViewer
                title={t('REPORT_ByProductTitle', 'Sales By Product')}
                subtitle={t(
                    'REPORT_ByProductSubtitle',
                    'Compare sold quantities grouped by product.'
                )}
                total={0}
                getData={getData}
                headers={headers}
            />
        </View>
    );
}
