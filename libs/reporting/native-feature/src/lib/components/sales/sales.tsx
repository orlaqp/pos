import React from 'react';
import { getSalesForRange } from '@pos/reporting/data-access';
import { OrderStatus } from '@pos/shared/models';
import { DateRange } from '@pos/shared/ui-native';

import ReportViewer, { ReportHeader } from '../report-viewer/report-viewer';
import moment from 'moment';
import i18next from 'i18next';

/* eslint-disable-next-line */
export interface SalesProps {}

export function Sales(_props: SalesProps) {
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;
    const headers: ReportHeader[] = [
        { label: t('REPORT_Header_Number', 'Number'), field: 'orderNo', width: 3 },
        { label: t('REPORT_Header_Employee', 'Employee'), field: 'employee', width: 3 },
        { label: t('REPORT_Header_Amount', 'Amount'), field: 'amount', width: 1, format: 'money', align: 'right', sum: true },
    ];

    const getData = (range: DateRange) => {
        range.startDate = range.startDate.startOf('day');
        range.endDate = range.endDate.endOf('day');

        return getSalesForRange(
            [OrderStatus.PAID, OrderStatus.PARTIALLY_REFUNDED],
            range
        ).then((sales) => {
            return sales?.map((s) => ({
                orderNo: s.orderNo,
                orderDate: moment(s.orderDate).format('YYYY-MM-DD hh:MM'),
                employee: s.employeeName,
                amount: s.total,
            }));
        });
    };

    return (
        <ReportViewer
            title={t('REPORT_SaleListTitle', 'Sale List')}
            subtitle={t(
                'REPORT_SaleListSubtitle',
                'Review paid transactions and totals for the selected period.'
            )}
            total={0}
            getData={getData}
            headers={headers}
        />
    );
}
