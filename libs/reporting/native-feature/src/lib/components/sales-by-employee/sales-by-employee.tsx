import { getSalesSummaryForRange } from '@pos/reporting/data-access';
import { DateRange } from '@pos/shared/ui-native';
import { sortDescListBy } from '@pos/shared/utils';
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
        { label: 'Amount', field: 'amount', width: 1, align: 'right', sum: true, format: 'money' },
    ];

    const getData = (range: DateRange) => {
        range.startDate = range.startDate.startOf('day');
        range.endDate = range.endDate.endOf('day');

        return getSalesSummaryForRange('PAID', range).then((summary) => {
            sortDescListBy(summary?.employees as any, 'amount');

            return summary?.employees?.map((e) => ({
                employee: e?.employeeName,
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

export default SalesByEmployee;
