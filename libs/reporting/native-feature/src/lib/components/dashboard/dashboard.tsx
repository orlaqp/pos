import React, { useEffect, useState } from 'react';
import { SalesSummary } from '@pos/shared/models';
import {
    DateRange,
    UIDateRange,
    UIEmptyState,
    UISpinner,
} from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import moment from 'moment';

import { View, ScrollView } from 'react-native';
import { LineChartComponent } from '../line-chart/line-chart';
import ListWidget from '../list-widget/list-widget';
import PieChart from '../pie-chart/pie-chart';
import Widget from '../widget/widget';

import { getSalesSummaryForRange } from '@pos/reporting/data-access';
import { sortDescListBy, sortListBy } from '@pos/shared/utils';
import { EACH } from '@pos/unit-of-measures/data-access';

/* eslint-disable-next-line */
export interface DashboardProps {}

export function Dashboard(props: DashboardProps) {
    const styles = useSharedStyles();
    const [loading, setLoading] = useState<boolean>(true);
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: moment().startOf('day'),
        endDate: moment().endOf('day'),
    });
    const [salesSummary, setSalesSummary] = useState<SalesSummary>();

    const updateDateRange = (range: DateRange) => {
        console.log('Range changed to: ', range);
        setDateRange(range);
    };

    useEffect(() => {
        console.log('date range:', dateRange);
        setLoading(true);

        const range = dateRange || {
            startDate: moment().startOf('day'),
            endDate: moment().endOf('day'),
        };

        range.startDate = range.startDate.startOf('day');
        range.endDate = range.endDate.endOf('day');

        getSalesSummaryForRange('PAID', range).then((summary) => {
            console.log('Result', summary);

            sortDescListBy(summary?.employees as any, 'amount');
            sortDescListBy(summary?.products as any, 'quantity');

            setSalesSummary(summary);
            setLoading(false);
        });
    }, [dateRange]);

    if (loading)
        return (
            <View style={[styles.page, { paddingTop: 50 }]}>
                <UISpinner size="small" message="Loading..." />
            </View>
        );

    return (
        <ScrollView style={[styles.page, { padding: 20 }]}>
            <UIDateRange
                initialRange={dateRange}
                onRangeChange={updateDateRange}
            />

            {!salesSummary ||
                (salesSummary.totalAmount === 0 && (
                    <View style={[styles.page, { paddingTop: 50 }]}>
                        <UIEmptyState text="No data found for this date range" />
                    </View>
                ))}

            {salesSummary && salesSummary?.totalAmount > 0 && (
                <>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Widget
                                backgroundColor="#1976d2"
                                icon="trending-up"
                                text="Gross Income"
                                value={`$ ${salesSummary.totalAmount.toFixed(
                                    2
                                )}`}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Widget
                                backgroundColor="#e91e63"
                                icon="sigma"
                                text="Total Sales"
                                value={salesSummary.totalOrders.toString()}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Widget
                                backgroundColor="#43a047"
                                icon="account-multiple-plus-outline"
                                text="New Customers"
                                value="N/A"
                            />
                        </View>
                    </View>
                    <View style={[styles.row, styles.smallMargin]}>
                        <View style={{ flex: 2 }}>
                            <PieChart
                                header="Top 5 Products"
                                items={
                                    !salesSummary.products
                                        ? []
                                        : salesSummary.products
                                              ?.slice(0, 5)
                                              .filter(p => p && p?.amount > 0)
                                              .map((p) => ({
                                                  name: `${p.unitOfMeasure} - ${p?.productName}`,
                                                  value: p.unitOfMeasure === EACH ? p.quantity : +((p.quantity).toFixed(2)),
                                              }))
                                }
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 40 }}>
                            <ListWidget
                                header="Top 5 Employees"
                                items={
                                    !salesSummary?.employees
                                        ? []
                                        : salesSummary?.employees
                                              ?.slice(0, 5)
                                              .map((e) => ({
                                                  name: e?.employeeName,
                                                  value: `$${e?.amount.toFixed(2)}`,
                                              }))
                                }
                            />
                        </View>
                    </View>
                    <View style={[styles.row, styles.smallMargin]}>
                        <LineChartComponent
                            header="Revenue over time"
                            data={salesSummary?.dates?.map((i) => ({
                                label: i?.datePart.substring(5),
                                values: [i?.amount],
                            }))}
                        />
                    </View>
                </>
            )}
        </ScrollView>
    );
}

export default Dashboard;
