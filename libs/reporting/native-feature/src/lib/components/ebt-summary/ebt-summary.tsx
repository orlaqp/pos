import {
    buildEbtSummaryRows,
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

export function EbtSummary() {
    const styles = useSharedStyles();
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key) ? String(i18next.t(key)) : fallback;

    const headers: ReportHeader[] = [
        { label: t('REPORT_Header_Metric', 'Metric'), field: 'metric', width: 4 },
        {
            label: t('REPORT_Header_Amount', 'Amount'),
            field: 'amount',
            width: 2,
            align: 'right',
            format: 'money',
            sum: true,
        },
    ];

    const getData = async (range: DateRange) => {
        const orders = await getOrdersForStatuses({
            statuses: [OrderStatus.PAID, OrderStatus.PARTIALLY_REFUNDED],
            range: normalizeReportRange(range),
        });

        return buildEbtSummaryRows(orders);
    };

    return (
        <View style={styles.page}>
            <ReportViewer
                title={t('REPORT_EbtSummaryTitle', 'EBT Summary')}
                subtitle={t(
                    'REPORT_EbtSummarySubtitle',
                    'Review EBT-eligible sales and EBT tender totals.'
                )}
                total={0}
                getData={getData}
                headers={headers}
            />
        </View>
    );
}

export default EbtSummary;
