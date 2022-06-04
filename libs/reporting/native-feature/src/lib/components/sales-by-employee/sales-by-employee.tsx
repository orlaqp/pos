import { getSalesSummaryForRange } from '@pos/reporting/data-access';
import { DateRange } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import React from 'react';

import { View, Text } from 'react-native';
import ReportViewer, { ReportHeader } from '../report-viewer/report-viewer';

/* eslint-disable-next-line */
export interface SalesByEmployeeProps {}

export function SalesByEmployee(props: SalesByEmployeeProps) {
    const styles = useSharedStyles();
    const headers: ReportHeader[] = [
        { label: 'Employee', field: 'employee', width: 5 },
        { label: 'Amount', field: 'amount', width: 1, align: 'right' },
    ];

    const getData = (range: DateRange) => {
        range.startDate = range.startDate.startOf('day');
        range.endDate = range.endDate.endOf('day');

        return getSalesSummaryForRange(range).then((summary) => {
            console.log('summary data', summary);
            return summary?.employees?.map((e) => ({
                employee: e?.employeeName,
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

export default SalesByEmployee;
