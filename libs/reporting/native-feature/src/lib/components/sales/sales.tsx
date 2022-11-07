import React from 'react';
import { getSalesForRange } from '@pos/reporting/data-access';
import { OrderStatus } from '@pos/shared/models';
import { DateRange } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';

import moment from 'moment';
import { HtmlReportViewer } from '../html-report-viewer/html-report-viewer';
import { ReportHeader } from '../html-report-viewer/definitions';

/* eslint-disable-next-line */
export interface SalesProps {}

export function Sales(props: SalesProps) {
    const styles = useSharedStyles();
    const headers: ReportHeader[] = [
        { label: 'Number', field: 'orderNo', width: 250 },
        { label: 'Employee', field: 'employee', width: 300 },
        { label: 'Amount', field: 'amount', width: 150, format: 'money', align: 'right', sum: true },
    ];

    const getData = (range: DateRange) => {
        range.startDate = range.startDate.startOf('day');
        range.endDate = range.endDate.endOf('day');

        return getSalesForRange(OrderStatus.PAID, range).then((sales) => {
            return sales?.map((s) => ({
                orderNo: s.orderNo,
                orderDate: moment(s.orderDate).format('YYYY-MM-DD hh:MM'),
                employee: s.employeeName,
                amount: s.total,
            }));
        });
    };

    return (
        // <View style={styles.page}>
            <HtmlReportViewer 
                title="Sales List"
                getData={getData}
                headers={headers}
                spacing='comfortable'
            />
        // </View>
    );
}
