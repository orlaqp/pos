import React from 'react';
import { getSalesForRange } from '@pos/reporting/data-access';
import { OrderStatus } from '@pos/shared/models';
import { DateRange } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';

import { View } from 'react-native';
import ReportViewer, { ReportHeader } from '../report-viewer/report-viewer';
import moment from 'moment';

/* eslint-disable-next-line */
export interface SalesProps {}

export function Sales(props: SalesProps) {
    const styles = useSharedStyles();
    const headers: ReportHeader[] = [
        { label: 'Date/Time', field: 'orderDate', width: 2 },
        { label: 'Employee', field: 'employee', width: 3 },
        { label: 'Amount', field: 'amount', width: 1, format: 'money', align: 'right', sum: true },
    ];

    const getData = (range: DateRange) => {
        range.startDate = range.startDate.startOf('day');
        range.endDate = range.endDate.endOf('day');

        return getSalesForRange(OrderStatus.PAID, range).then((sales) => {
            return sales?.map((s) => ({
                orderDate: moment(s.orderDate).format('YYYY-MM-DD hh:MM'),
                employee: s.employeeName,
                amount: s.total,
            }));
        });
    };

    return (
        <View style={styles.page}>
            <ReportViewer getData={getData} headers={headers} />
        </View>
    );
}
