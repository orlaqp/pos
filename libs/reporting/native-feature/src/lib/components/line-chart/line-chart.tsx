import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import React, { useState } from 'react';
import i18next from 'i18next';

import { View, Text, StyleSheet } from 'react-native';
import { LineChart as BaseLineChart } from 'react-native-chart-kit';
const LineChart = BaseLineChart as any;

export interface LineChartItem {
    label: string;
    values: number[];
}

export interface LineChartProps {
    header: string;
    data: LineChartItem[];
}

export const toLineChartDataset = (data: LineChartItem[]) => {
    const parsedData: { labels: string[]; datasets: { data: number[] }[] } = {
        labels: [],
        datasets: data[0].values.map(() => ({ data: [] })),
    };

    data.reduce((d, item) => {
        d.labels.push(item.label);
        item.values.forEach((v, idx) => d.datasets[idx].data.push(v));
        return d;
    }, parsedData);

    return parsedData;
};

export const buildLineChartConfig = (textColor: string) => ({
    backgroundGradientFrom: `transparent`,
    backgroundGradientTo: `transparent`,
    decimalPlaces: 2,
    color: (opacity = 1) => textColor,
    labelColor: (opacity = 1) => textColor,
    style: {
        borderRadius: 2,
    },
    propsForDots: {
        r: '6',
        strokeWidth: '2',
        stroke: '#ffa726',
    },
});

export function LineChartComponent({ header, data }: LineChartProps) {
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const local = useStyles(tokens);
    const [width, setWidth] = useState<number>();
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;

    if (!data?.length)
        return (
            <View style={local.emptyState}>
                <Text style={local.emptyTitle}>
                    {t('CHART_NoData', 'No data provided')}
                </Text>
            </View>
        );

    const parsedData = toLineChartDataset(data);

    return (
        <View
            testID="line-chart-container"
            style={local.container}
            onLayout={(event) => {
                const { width } = event.nativeEvent.layout;
                setWidth(width);
            }}
        >
            <View style={local.headerRow}>
                <Text style={local.eyebrow}>
                    {t('CHART_Trend', 'Trend')}
                </Text>
                <Text style={local.title}>{header}</Text>
            </View>
            <View style={local.chartSurface}>
                {!!width && (
                    <LineChart
                        data={parsedData}
                        width={Math.max(width - 24, 0)} // from react-native
                        height={220}
                        yAxisLabel="$"
                        yAxisSuffix=""
                        yAxisInterval={1} // optional, defaults to 1
                        chartConfig={buildLineChartConfig(styles.secondaryText.color)}
                        bezier
                        style={local.chart}
                    />
                )}
            </View>
        </View>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        container: {
            width: '100%',
        },
        headerRow: {
            marginBottom: tokens.spacing.md,
        },
        eyebrow: {
            color: tokens.colors.accent,
            fontSize: 11,
            fontWeight: '800',
            letterSpacing: 1.4,
            marginBottom: 4,
            textTransform: 'uppercase',
        },
        title: {
            color: tokens.colors.textPrimary,
            fontSize: 18,
            fontWeight: '800',
        },
        chartSurface: {
            minHeight: 238,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: '#243145',
            backgroundColor: '#090D14',
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.sm,
            overflow: 'hidden',
        },
        chart: {
            marginVertical: 0,
            borderRadius: 18,
        },
        emptyState: {
            minHeight: 180,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 22,
            borderWidth: 1,
            borderColor: '#243145',
            backgroundColor: '#090D14',
            padding: tokens.spacing.xl,
        },
        emptyTitle: {
            color: tokens.colors.textSecondary,
            fontSize: 15,
            fontWeight: '700',
        },
    });

export default LineChart;
