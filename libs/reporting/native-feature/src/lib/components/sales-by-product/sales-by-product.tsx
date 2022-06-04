import { getSalesSummaryForRange } from '@pos/reporting/data-access';
import { DateRange } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import React from 'react';

import { View } from 'react-native';
import ReportViewer, { ReportHeader } from '../report-viewer/report-viewer';

/* eslint-disable-next-line */
export interface SalesByProductProps {}

export function SalesByProduct(props: SalesByProductProps) {
    const styles = useSharedStyles();
    const headers: ReportHeader[] = [
        { label: 'Product', field: 'product', width: 5 },
        { label: 'Amount', field: 'amount', width: 1, align: 'right' },
    ];

    const getData = (range: DateRange) => {
        range.startDate = range.startDate.startOf('day');
        range.endDate = range.endDate.endOf('day');

        return getSalesSummaryForRange(range).then((summary) => {
            console.log('summary data', summary);
            return summary?.products?.map((e) => ({
                product: e?.productName,
                amount: `$${e?.amount.toFixed(2)}`,
            }));
        });
    };

    return (
        <View style={styles.page}>
            <ReportViewer getData={getData} headers={headers} />
        </View>
    );
}
