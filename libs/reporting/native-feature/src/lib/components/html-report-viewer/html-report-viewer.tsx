import {
    DateRange,
    UIDateRange,
    UIEmptyState,
    UISpinner,
} from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { Text, useTheme } from '@rneui/themed';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

import { View, useWindowDimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import RenderHtml, { MixedStyleRecord } from 'react-native-render-html';
import { ReportHeader } from './definitions';
import { HtmlTable, TableLayout } from './html-table';

/* eslint-disable-next-line */
export interface HtmlReportViewerProps {
    title?: string;
    headers: ReportHeader[];
    getData: (range: DateRange) => Promise<any[] | undefined>;
    spacing: keyof (typeof TableLayout);
}

export function HtmlReportViewer({ title, getData, headers, spacing }: HtmlReportViewerProps) {
    const { width } = useWindowDimensions();

    const styles = useSharedStyles();
    const theme = useTheme();
    const [loading, setLoading] = useState<boolean>(true);
    const [totals, setTotals] = useState<Record<string, number>>();
    const [items, setItems] = useState<any[] | undefined>(true);
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: moment().startOf('day'),
        endDate: moment().endOf('day'),
    });

    useEffect(() => {
        setLoading(true);
        getData(dateRange).then((res) => setItems(res));
        setLoading(false);
    }, [getData, dateRange]);

    // useEffect(() => {
    //     if (!items.length) return;

    //     const totals: Record<string, number> = {};
    //     items.reduce((total, item) => {
    //         headers.forEach((h) => {
    //             if (h.sum) {
    //                 total[h.field] = (total[h.field] || 0) + item[h.field];
    //             }
    //         });

    //         return total;
    //     }, totals);

    //     setTotals(totals);
    // }, [headers, items]);

    if (loading)
        return (
            <View style={[styles.page, { paddingTop: 50 }]}>
                <UISpinner size="small" message="Loading..." />
            </View>
        );

    if (!items?.length) {
        return <UIEmptyState text="No information found for this date range" />;
    }

    const source = {
        html: `
            <h3 style="text-align: center;">${title}</h3>
            ${HtmlTable({ headers, items, spacing })}
        `,
    };

    const style: MixedStyleRecord = {
        body: {
            padding: '0 80px 40px 80px',
        },
        p: {
            textAlign: 'center',
        },
    };

    return (
        <View style={[{ flexDirection: 'column', margin: 20, height: '100%' }]}>
            <View style={{ flex: .55, zIndex: 2000 }}>
                <UIDateRange
                    initialRange={dateRange}
                    onRangeChange={setDateRange}
                />
            </View>
            <View style={{ flex: 4 }}>
            <ScrollView >
                <RenderHtml
                    contentWidth={width}
                    source={source}
                    tagsStyles={style}
                />
            </ScrollView>
            </View>
        </View>
    );
}
