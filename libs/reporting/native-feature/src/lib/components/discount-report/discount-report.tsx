import {
    buildDiscountReportRows,
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

export function DiscountReport() {
    const styles = useSharedStyles();
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key) ? String(i18next.t(key)) : fallback;

    const headers: ReportHeader[] = [
        { label: t('REPORT_Header_Discount', 'Discount'), field: 'discount', width: 4 },
        {
            label: t('REPORT_Header_Amount', 'Amount'),
            field: 'amount',
            width: 1.5,
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
    ];

    const getData = async (range: DateRange) => {
        const orders = await getOrdersForStatuses({
            statuses: [OrderStatus.PAID],
            range: normalizeReportRange(range),
        });

        return buildDiscountReportRows(orders);
    };

    return (
        <View style={styles.page}>
            <ReportViewer
                title={t('REPORT_DiscountReportTitle', 'Discount Report')}
                subtitle={t(
                    'REPORT_DiscountReportSubtitle',
                    'Track discount usage, amounts, and impacted orders.'
                )}
                total={0}
                getData={getData}
                headers={headers}
            />
        </View>
    );
}

export default DiscountReport;
