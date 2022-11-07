import {
    DateRange,
    UIDateRange,
    UIEmptyState,
    UISpinner,
} from '@pos/shared/ui-native';
import { PDFService } from '@pos/shared/utils';
import { useSharedStyles } from '@pos/theme/native';
import { Button, Text, useTheme } from '@rneui/themed';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

import { View, useWindowDimensions, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import RenderHtml, { MixedStyleRecord } from 'react-native-render-html';
import { ReportHeader } from './definitions';
import { HtmlTable, TableLayout } from './html-table';
import { DesktopPrintingService } from '@pos/printings/data-access';

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
        startDate: moment().startOf('day').subtract(1, 'day'),
        endDate: moment().endOf('day'),
    });

    const source = {
        html: `
            <h3 style="text-align: center;">${title}</h3>
            ${HtmlTable({ headers, items, spacing })}
        `,
    };

    const style: MixedStyleRecord = {
        body: {
            padding: '0 80px 40px 80px',
            backgroundColor: 'transparent',
        },
        p: {
            textAlign: 'center',
        },
    };

    const exportReport = async () => {
        const res = await PDFService.create(source.html, 'report');
        console.log('====================================');
        console.log(res.filePath);
        console.log('====================================');
        Alert.alert('File', res.filePath);
    }

    const print = async () => {
        await DesktopPrintingService.selectPrinter();
        // await DesktopPrintingService.printHTML(source.html);
    }

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

    return (
        <View style={[{ flexDirection: 'column', margin: 20, height: '100%' }]}>
            <View style={{ flex: .55, zIndex: 2000, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 5, marginLeft: 50 }}>
                    <UIDateRange
                        initialRange={dateRange}
                        onRangeChange={setDateRange}
                    />
                </View>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Button
                        type="clear"
                        icon={{
                            name: 'export-variant',
                            type: 'material-community',
                            color: theme.theme.colors.primary
                        }}
                        onPress={exportReport}
                    />
                    <Button
                        type="clear"
                        icon={{
                            name: 'printer',
                            type: 'material-community',
                            color: theme.theme.colors.primary
                        }}
                        onPress={print}
                    />
                </View>
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
