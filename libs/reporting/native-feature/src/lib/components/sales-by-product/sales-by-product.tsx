import { getSalesSummaryForRange } from '@pos/reporting/data-access';
import { DateRange } from '@pos/shared/ui-native';
import { sortDescListBy } from '@pos/shared/utils';
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
        { label: 'Amount', field: 'amount', width: 1, align: 'right', format: 'money', sum: true },
    ];

    const getData = (range: DateRange) => {
        range.startDate = range.startDate.startOf('day');
        range.endDate = range.endDate.endOf('day');

        return getSalesSummaryForRange('PAID', range).then((summary) => {
            sortDescListBy(summary?.products as any, 'amount');

            return summary?.products?.map((e) => ({
                product: e?.productName,
                amount: e?.amount,
            }));
        });
    };

    return (
        <View style={styles.page}>
            <ReportViewer getData={getData} headers={headers} />
        </View>
    );
}
