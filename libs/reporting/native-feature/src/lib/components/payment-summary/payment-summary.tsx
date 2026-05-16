import {
    buildPaymentSummaryRows,
    getRefundsForRange,
    getOrdersForStatuses,
} from '@pos/reporting/data-access';
import { OrderStatus } from '@pos/shared/models';
import { DateRange } from '@pos/shared/ui-native';
import React from 'react';
import i18next from 'i18next';
import { View } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import ReportViewer, { ReportHeader } from '../report-viewer/report-viewer';
import { normalizeReportRange } from '../report-utils';

export function PaymentSummary() {
    const styles = useSharedStyles();
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key) ? String(i18next.t(key)) : fallback;

    const headers: ReportHeader[] = [
        { label: t('REPORT_Header_PaymentType', 'Payment Type'), field: 'paymentType', width: 3 },
        {
            label: t('REPORT_Header_Amount', 'Amount'),
            field: 'amount',
            width: 2,
            align: 'right',
            format: 'money',
            sum: true,
        },
        {
            label: t('REPORT_Header_Count', 'Count'),
            field: 'count',
            width: 1,
            align: 'right',
            format: 'integer',
            sum: true,
        },
        { label: t('REPORT_Header_Share', 'Share'), field: 'percent', width: 1, align: 'right' },
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

        return buildPaymentSummaryRows(orders, refunds);
    };

    return (
        <View style={styles.page}>
            <ReportViewer
                title={t('REPORT_PaymentSummaryTitle', 'Payment Summary')}
                subtitle={t(
                    'REPORT_PaymentSummarySubtitle',
                    'See how customers paid across the selected period.'
                )}
                total={0}
                getData={getData}
                headers={headers}
            />
        </View>
    );
}

export default PaymentSummary;
