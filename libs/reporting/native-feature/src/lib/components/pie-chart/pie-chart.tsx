import { useDesignTokens } from '@pos/theme/native/design-tokens';
import React, { useState } from 'react';
import i18next from 'i18next';

import { View, Text, StyleSheet } from 'react-native';
import { PieChart as BasePieChart } from 'react-native-chart-kit';
const PC = BasePieChart as any;

const legendFontSize = 13;
const legendFontColor = '#D6E2F0';
const colors = ['#4aa3eb', '#e91e63', '#43a047', '#ffb020', '#8e7cff'];

export interface PieItem {
    name: string;
    value: number;
}

export interface PieChartProps {
    header: string;
    items: PieItem[];
}

export const buildPieChartConfig = () => ({
    backgroundGradientFrom: '#1E2923',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#08130D',
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
});

export function PieChart({ header, items }: PieChartProps) {
    const tokens = useDesignTokens();
    const local = useStyles(tokens);
    const [width, setWidth] = useState<number>();
    const chartConfig = buildPieChartConfig();
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;

    if (!items?.length)
      return (
          <View style={local.emptyState}>
              <Text style={local.emptyTitle}>
                  {t('CHART_NoData', 'No data provided')}
              </Text>
          </View>
      )

    const data = items.map((i, idx) => ({
        name: i.name,
        value: i.value,
        color: colors[idx],
        legendFontColor,
        legendFontSize,
    }))

    return (
        <View
            style={local.container}
            onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        >
            <View style={local.chartSurface}>
                <View style={local.headerRow}>
                    <Text style={local.eyebrow}>{t('CHART_Mix', 'Mix')}</Text>
                    <Text style={local.title}>{header}</Text>
                </View>
                {!!width && (
                    <PC
                        data={data}
                        width={Math.max(width - 24, 0)}
                        height={210}
                        chartConfig={chartConfig}
                        accessor={'value'}
                        backgroundColor={'transparent'}
                        paddingLeft={'12'}
                        center={[0, 0]}
                        absolute
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
            minHeight: 230,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: '#243145',
            backgroundColor: '#090D14',
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.sm,
            overflow: 'hidden',
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

export default PieChart;
