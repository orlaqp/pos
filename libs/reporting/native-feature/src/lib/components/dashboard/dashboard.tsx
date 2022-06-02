import { DateRange, UIDateRange } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import moment from 'moment';

import React, { useState } from 'react';

import { View, ScrollView } from 'react-native';
import { LineChartComponent } from '../line-chart/line-chart';
import ListWidget from '../list-widget/list-widget';
import PieChart from '../pie-chart/pie-chart';
import Widget from '../widget/widget';

/* eslint-disable-next-line */
export interface DashboardProps {}

export function Dashboard(props: DashboardProps) {
    const styles = useSharedStyles();
    const value = 2500;

    const updateDateRange = (range: DateRange) => {
        console.log('Range changed to: ', range);
    };

    return (
        <ScrollView style={[styles.page, { padding: 20 }]}>
            <UIDateRange
                initialRange={{
                    startDate: moment().add(-7, 'days'),
                    endDate: moment(),
                }}
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
