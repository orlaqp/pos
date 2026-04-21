import {
    buildLowSalesItemRows,
    getOrdersForStatuses,
    getRefundLinesForRefundIds,
    getRefundsForRange,
} from '@pos/reporting/data-access';
import { ProductService, selectAllProducts } from '@pos/products/data-access';
import { OrderStatus } from '@pos/shared/models';
import { DateRange } from '@pos/shared/ui-native';
import React from 'react';
import i18next from 'i18next';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { useSharedStyles } from '@pos/theme/native';
import ReportViewer, { ReportHeader } from '../report-viewer/report-viewer';
import { normalizeReportRange } from '../report-utils';

export function LowSalesItems() {
    const styles = useSharedStyles();
    const products = useSelector(selectAllProducts);
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key) ? String(i18next.t(key)) : fallback;

    const headers: ReportHeader[] = [
        { label: t('REPORT_Header_Product', 'Product'), field: 'product', width: 4 },
        { label: t('REPORT_Header_Status', 'Status'), field: 'status', width: 1.5 },
        {
            label: t('REPORT_Header_Quantity', 'Quantity'),
            field: 'quantity',
            width: 1,
            align: 'right',
            format: 'float',
        },
        {
            label: t('REPORT_Header_Sales', 'Sales'),
            field: 'sales',
            width: 1.5,
            align: 'right',
            format: 'money',
        },
    ];

    const getData = async (range: DateRange) => {
        const normalizedRange = normalizeReportRange(range);
        const [orders, loadedProducts, refunds] = await Promise.all([
            getOrdersForStatuses({
                statuses: [OrderStatus.PAID, OrderStatus.PARTIALLY_REFUNDED],
                range: normalizedRange,
            }),
            ProductService.getAll(),
            getRefundsForRange({ range: normalizedRange }),
        ]);
        const refundLines = await getRefundLinesForRefundIds(
            refunds.map((refund) => refund.id).filter(Boolean)
        );

        const mergedProducts = [
            ...(loadedProducts as any[]),
            ...((products as any[]) || []),
        ].filter(
            (product, index, list) =>
                product?.id &&
                list.findIndex((candidate) => candidate?.id === product.id) === index
        );

        return buildLowSalesItemRows(orders, mergedProducts as any, refundLines);
    };

    return (
        <View style={styles.page}>
            <ReportViewer
                title={t('REPORT_LowSalesItemsTitle', 'Low / No Sales Items')}
                subtitle={t(
                    'REPORT_LowSalesItemsSubtitle',
                    'Spot products that are not moving in the selected range.'
                )}
                total={0}
                getData={getData}
                headers={headers}
            />
        </View>
    );
}

export default LowSalesItems;
