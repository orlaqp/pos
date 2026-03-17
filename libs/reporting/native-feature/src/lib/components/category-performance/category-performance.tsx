import {
    buildCategoryPerformanceRows,
    getOrdersForStatuses,
} from '@pos/reporting/data-access';
import { OrderStatus } from '@pos/shared/models';
import { DateRange } from '@pos/shared/ui-native';
import { selectAllCategories } from '@pos/categories/data-access';
import React, { useMemo } from 'react';
import i18next from 'i18next';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { useSharedStyles } from '@pos/theme/native';
import ReportViewer, { ReportHeader } from '../report-viewer/report-viewer';
import { normalizeReportRange } from '../report-utils';

export function CategoryPerformance() {
    const styles = useSharedStyles();
    const categories = useSelector(selectAllCategories);
    const categoriesById = useMemo(
        () => Object.fromEntries((categories || []).map((category) => [category.id, category.name])),
        [categories]
    );
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key) ? String(i18next.t(key)) : fallback;

    const headers: ReportHeader[] = [
        { label: t('REPORT_Header_Category', 'Category'), field: 'category', width: 4 },
        {
            label: t('REPORT_Header_Sales', 'Sales'),
            field: 'sales',
            width: 1.5,
            align: 'right',
            format: 'money',
            sum: true,
        },
        {
            label: t('REPORT_Header_Units', 'Units'),
            field: 'units',
            width: 1,
            align: 'right',
            format: 'float',
            sum: true,
        },
    ];

    const getData = async (range: DateRange) => {
        const orders = await getOrdersForStatuses({
            statuses: [OrderStatus.PAID],
            range: normalizeReportRange(range),
        });

        return buildCategoryPerformanceRows(orders, categoriesById);
    };

    return (
        <View style={styles.page}>
            <ReportViewer
                title={t('REPORT_CategoryPerformanceTitle', 'Category Performance')}
                subtitle={t(
                    'REPORT_CategoryPerformanceSubtitle',
                    'Review sales and units sold grouped by category.'
                )}
                total={0}
                getData={getData}
                headers={headers}
            />
        </View>
    );
}

export default CategoryPerformance;
