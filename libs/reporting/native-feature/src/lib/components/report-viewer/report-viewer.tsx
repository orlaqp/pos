import { DateRange, UIDateRange, UISpinner } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

import { FlatList, Text, View } from 'react-native';

export interface ReportHeader {
    label: string;
    field: string;
    format?: 'string' | 'integer' | 'float' | 'money';
    width: number;
    align?: 'auto' | 'left' | 'right' | 'center' | 'justify' | undefined;
    sum?: boolean;
}

/* eslint-disable-next-line */
export interface ReportViewerProps {
    total: number;
    headers: ReportHeader[];
    getData: (range: DateRange) => Promise<any[]>;
}

export function ReportViewer({ getData, headers }: ReportViewerProps) {
    const styles = useSharedStyles();
    const [loading, setLoading] = useState<boolean>(true);
    const [totals, setTotals] = useState<Record<string, number>>();
    const [items, setItems] = useState<any[]>(true);
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: moment().startOf('day'),
        endDate: moment().endOf('day'),
    });

    useEffect(() => {
        setLoading(true);
        getData(dateRange).then((res) => setItems(res));
        setLoading(false);
    }, [getData, dateRange]);

    useEffect(() => {
        if (!items.length) return;

        const totals: Record<string, number> = {};
        items.reduce((total, item) => {
            headers.forEach((h) => {
                if (h.sum) {
                    total[h.field] = (total[h.field] || 0) + item[h.field];
                }
            });

            return total;
        }, totals);

        setTotals(totals);
    }, [headers, items]);

    if (loading)
        return (
            <View style={[styles.page, { paddingTop: 50 }]}>
                <UISpinner size="small" message="Loading..." />
            </View>
        );

    return (
        <View style={[styles.page, { flexDirection: 'column', margin: 20 }]}>
            <View
                style={{
                    flex: 7,
                    backgroundColor: styles.dataRow.backgroundColor,
                    borderRadius: 5,
                    marginHorizontal: 150,
                    paddingHorizontal: 30,
                    // paddingVertical: 20,
                }}
            >
                <View style={{ flex: 1 }}>
                    <UIDateRange
                        initialRange={dateRange}
                        onRangeChange={setDateRange}
                    />
                </View>

                <View
                    style={{
                        flexDirection: 'row',
                        marginBottom: 15,
                        flex: 0.2,
                    }}
                >
                    {headers.map((h, idx) => (
                        <View key={idx} style={{ flex: h.width }}>
                            <Text
                                style={[
                                    styles.secondaryText,
                                    { textAlign: h.align },
                                ]}
                            >
                                {h.label}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={{ flex: 6 }}>
                    <FlatList
                        data={items}
                        renderItem={(data: any, idx: number) => (
                            <View key={idx} style={{ flexDirection: 'row' }}>
                                {headers.map((h) => (
                                    <View
                                        style={{
                                            flex: h.width,
                                            marginBottom: 5,
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.primaryText,
                                                { textAlign: h.align },
                                            ]}
                                        >
                                            {h.format === 'money'
                                                ? `$${data.item[
                                                      h.field
                                                  ].toFixed(2)}`
                                                : data.item[h.field]}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    />
                </View>

                {totals && (
                    <View style={{ flex: .3 }}>
                        {headers.map((h, idx) => (
                            <View key={idx} style={{ flex: h.width }}>
                                <Text
                                    style={[
                                        styles.primaryText,
                                        { textAlign: h.align, fontSize: 16, fontWeight: 'bold', marginTop: -20 },
                                    ]}
                                >
                                    {h.sum ? `$${totals[h.field].toFixed(2)}` : ''}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}

export default ReportViewer;
