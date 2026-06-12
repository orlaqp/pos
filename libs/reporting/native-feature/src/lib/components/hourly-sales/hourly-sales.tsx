import {
    buildHourlySalesRows,
    getOrdersForStatuses,
    getRefundsForRange,
} from '@pos/reporting/data-access';
import { OrderStatus } from '@pos/shared/models';
import { DateRange } from '@pos/shared/ui-native';
import React from 'react';
import i18next from 'i18next';
import { View } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import ReportViewer, { ReportHeader } from '../report-viewer/report-viewer';
import { normalizeReportRange } from '../report-utils';

export function HourlySales() {
    const styles = useSharedStyles();
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key) ? String(i18next.t(key)) : fallback;

    const headers: ReportHeader[] = [
        { label: t('REPORT_Header_Hour', 'Hour'), field: 'hour', width: 1.5 },
        {
            label: t('REPORT_Header_Sales', 'Sales'),
            field: 'sales',
            width: 1.5,
            align: 'right',
            format: 'money',
            sum: true,
        },
        {
            label: t('REPORT_Header_Tax', 'Tax'),
            field: 'tax',
            width: 1,
            align: 'right',
            format: 'money',
            sum: true,
        },
        {
            label: t('REPORT_Header_Orders', 'Orders'),
            field: 'orders',
            width: 1,
            align: 'right',
            format: 'integer',
            sum: true,
        },
        {
            label: t('REPORT_Header_AverageTicket', 'Avg Ticket'),
            field: 'averageTicket',
            width: 1.5,
            align: 'right',
            format: 'money',
        },
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

        return buildHourlySalesRows(orders, refunds);
    };

    return (
        <View style={styles.page}>
            <ReportViewer
                title={t('REPORT_HourlySalesTitle', 'Hourly Sales')}
                subtitle={t(
                    'REPORT_HourlySalesSubtitle',
                    'Understand sales volume by hour of day.'
                )}
                total={0}
                getData={getData}
                headers={headers}
            />
        </View>
    );
}

export default HourlySales;
