import {
    buildOpenOrdersAgingRows,
    getOpenOrders,
} from '@pos/reporting/data-access';
import { DateRange } from '@pos/shared/ui-native';
import React from 'react';
import i18next from 'i18next';
import { View } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import ReportViewer, { ReportHeader } from '../report-viewer/report-viewer';

export function OpenOrdersAging() {
    const styles = useSharedStyles();
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key) ? String(i18next.t(key)) : fallback;

    const headers: ReportHeader[] = [
        { label: t('REPORT_Header_OrderNo', 'Order #'), field: 'orderNo', width: 1.2 },
        { label: t('REPORT_Header_Employee', 'Employee'), field: 'employee', width: 2.2 },
        {
            label: t('REPORT_Header_Total', 'Total'),
            field: 'total',
            width: 1.2,
            align: 'right',
            format: 'money',
            sum: true,
        },
        {
            label: t('REPORT_Header_AgeMinutes', 'Age (min)'),
            field: 'ageMinutes',
            width: 1.2,
            align: 'right',
            format: 'integer',
        },
        { label: t('REPORT_Header_Bucket', 'Bucket'), field: 'ageBucket', width: 1.2, align: 'right' },
    ];

    const getData = async (_range: DateRange) => {
        const orders = await getOpenOrders();
        return buildOpenOrdersAgingRows(orders);
    };

    return (
        <View style={styles.page}>
            <ReportViewer
                title={t('REPORT_OpenOrdersAgingTitle', 'Open Orders Aging')}
                subtitle={t(
                    'REPORT_OpenOrdersAgingSubtitle',
                    'Track how long current open orders have been waiting.'
                )}
                total={0}
                getData={getData}
                headers={headers}
            />
        </View>
    );
}

export default OpenOrdersAging;
