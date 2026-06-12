import {
    buildSalesByEmployeeRows,
    getOrdersForStatuses,
    getRefundsForRange,
} from '@pos/reporting/data-access';
import { DateRange } from '@pos/shared/ui-native';
import { sortDescListBy } from '@pos/shared/utils';
import { useSharedStyles } from '@pos/theme/native';
import { OrderStatus, SalesSummary } from '@pos/shared/models';
import React from 'react';
import i18next from 'i18next';

import { View } from 'react-native';
import ReportViewer, { ReportHeader } from '../report-viewer/report-viewer';
import { normalizeReportRange } from '../report-utils';

/* eslint-disable-next-line */
export interface SalesByEmployeeProps {}

export const toSalesByEmployeeRows = (summary?: SalesSummary) => {
    sortDescListBy(summary?.employees as any, 'amount');
    return summary?.employees?.map((e) => ({
        employee: e?.employeeName,
        amount: e?.amount,
        tax: 0,
    }));
};

export function SalesByEmployee(props: SalesByEmployeeProps) {
    const styles = useSharedStyles();
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;
    const headers: ReportHeader[] = [
        { label: t('REPORT_Header_Employee', 'Employee'), field: 'employee', width: 4 },
        { label: t('REPORT_Header_Tax', 'Tax'), field: 'tax', width: 1, align: 'right', sum: true, format: 'money' },
        { label: t('REPORT_Header_Amount', 'Amount'), field: 'amount', width: 1, align: 'right', sum: true, format: 'money' },
    ];

    const getData = async (range: DateRange) => {
        const normalizedRange = normalizeReportRange(range);
        const [orders, refunds] = await Promise.all([
            getOrdersForStatuses({
                statuses: [OrderStatus.PAID, OrderStatus.PARTIALLY_REFUNDED],
                range: normalizedRange,
            }),
            getRefundsForRange({ range: normalizedRange }),
        ]);

        return buildSalesByEmployeeRows(orders, refunds).map((row) => ({
            employee: row.employeeName,
            tax: row.tax,
            amount: row.amount,
        }));
    };

    return (
        <View style={styles.page}>
            <ReportViewer
                title={t('REPORT_ByEmployeeTitle', 'Sales By Employee')}
                subtitle={t(
                    'REPORT_ByEmployeeSubtitle',
                    'Compare paid totals grouped by employee.'
                )}
                total={0}
                getData={getData}
                headers={headers}
            />
        </View>
    );
}

export default SalesByEmployee;
