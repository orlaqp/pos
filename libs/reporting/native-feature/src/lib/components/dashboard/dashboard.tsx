import { GraphQLResult } from '@aws-amplify/api-graphql';
import { getSalesSummary, listOrders } from '@pos/shared/api';
import { Child, SalesSummary } from '@pos/shared/models';
import { DateRange, UIDateRange, UIEmptyState, UISpinner } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { API, DataStore, graphqlOperation } from 'aws-amplify';

import moment from 'moment';

import React, { useEffect, useState } from 'react';

import { View, ScrollView } from 'react-native';
import { LineChartComponent } from '../line-chart/line-chart';
import ListWidget from '../list-widget/list-widget';
import PieChart from '../pie-chart/pie-chart';
import Widget from '../widget/widget';

import { Parent } from '@pos/shared/models';

/* eslint-disable-next-line */
export interface DashboardProps {}

export function Dashboard(props: DashboardProps) {
    const styles = useSharedStyles();
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: moment().add(-7, 'days'),
        endDate: moment(),
    });
    const [salesSummary, setSalesSummary] = useState<SalesSummary>();
    const [loading, setLoading] = useState<boolean>(true);
    const value = 2500;

    const updateDateRange = (range: DateRange) => {
        console.log('Range changed to: ', range);
        setDateRange(range);
    };

    useEffect(() => {
        console.log('date range:', dateRange);
        setLoading(true);

        const range = dateRange || {
            startDate: moment().add(-7, 'days'),
            endDate: moment(),
        };

        const promise = API.graphql<SalesSummary>({
            query: getSalesSummary,
            variables: {
                from: range?.startDate.startOf('day').toISOString(),
                to: range?.endDate.endOf('day').toISOString(),
            },
        }) as Promise<GraphQLResult<{ getSalesSummary: SalesSummary }>>;

        promise.then((res) => {
            console.log('Result', res.data?.getSalesSummary);
            setSalesSummary(res.data?.getSalesSummary);
            setLoading(false);
        });
    }, [dateRange]);

    if (loading) 
        return (
            <View style={[styles.page, { paddingTop: 50 }]}>
                <UISpinner size="small" message="Loading..." />
            </View>
        );

    if (!salesSummary || salesSummary.totalAmount === 0)
        return (
            <View style={[styles.page, { paddingTop: 50 }]}>
                <UIEmptyState
                    text='No data found for this date range'
                />
            </View>
        );

    return (
        <ScrollView style={[styles.page, { padding: 20 }]}>
            <UIDateRange
                initialRange={dateRange}
                onRangeChange={updateDateRange}
            />
            <View style={styles.row}>
                <View style={{ flex: 1 }}>
                    <Widget
                        backgroundColor="#1976d2"
                        icon="trending-up"
                        text="Gross Income"
                        value={`$ ${value.toFixed(2)}`}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Widget
                        backgroundColor="#e91e63"
                        icon="sigma"
                        text="Total Sales"
                        value="275"
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Widget
                        backgroundColor="#43a047"
                        icon="cash-multiple"
                        text="Revenue"
                        value={`$ ${value.toFixed(2)}`}
                    />
                </View>
            </View>
            <View style={[styles.row, styles.smallMargin]}>
                <View style={{ flex: 2 }}>
                    <PieChart header="Top 5 Products" />
                </View>
                <View style={{ flex: 1, marginLeft: 40 }}>
                    <ListWidget
                        header="Top 5 Employees"
                        items={[
                            { text: 'John Doe', value: '$ 2,110.00' },
                            { text: 'Jane Doe', value: '$ 810.00' },
                            { text: 'John Doe', value: '$ 500.00' },
                            { text: 'John Doe', value: '$ 210.00' },
                            { text: 'John Doe', value: '$ 200.00' },
                        ]}
                    />
                </View>
            </View>
            <View style={[styles.row, styles.smallMargin]}>
                <LineChartComponent header="Revenue over time" />
            </View>
        </ScrollView>
    );
}

export default Dashboard;
