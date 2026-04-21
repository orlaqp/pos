import { getSalesSummaryForRange } from '@pos/reporting/data-access';
import { DateRange } from '@pos/shared/ui-native';
import { sortDescListBy } from '@pos/shared/utils';
import { useSharedStyles } from '@pos/theme/native';
import React from 'react';
import { OrderStatus, SalesSummary } from '@pos/shared/models';
import i18next from 'i18next';

import { View } from 'react-native';
import ReportViewer, { ReportHeader } from '../report-viewer/report-viewer';

/* eslint-disable-next-line */
export interface SalesByProductProps {}

export const toSalesByProductRows = (summary: SalesSummary | undefined) => {
    const rows = [...(summary?.products || [])];
    sortDescListBy(rows as any, 'quantity');

    return rows.map((item) => ({
        product: item?.productName || 'Unknown',
        amount: Number(item?.quantity || 0).toFixed(2),
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
        { label: t('REPORT_Header_Product', 'Product'), field: 'product', width: 5 },
        { label: t('REPORT_Header_Quantity', 'Quantity'), field: 'amount', width: 1, align: 'right' },
    ];

    const getData = async (range: DateRange) => {
        const normalizedRange = normalizeSalesByProductRange(range);
        const summary = await getSalesSummaryForRange(
            [OrderStatus.PAID, OrderStatus.PARTIALLY_REFUNDED],
            normalizedRange
        );

        return toSalesByProductRows(summary);
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
