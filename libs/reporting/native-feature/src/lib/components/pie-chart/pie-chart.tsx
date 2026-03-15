import { useSharedStyles } from '@pos/theme/native';
import React from 'react';
import i18next from 'i18next';

import { View, Text } from 'react-native';
import { PieChart as BasePieChart } from 'react-native-chart-kit';
const PC = BasePieChart as any;

const legendFontSize = 15;
const legendFontColor = '#7F7F7F';
const colors = ['#1976d2', '#e91e63', '#43a047', '#6d4c41', '#f57c00'];

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
    const styles = useSharedStyles();
    const chartConfig = buildPieChartConfig();
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;

    if (!items?.length)
      return (
          <View style={styles.centered}>
              <Text style={styles.secondaryText}>
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
        <View>
            <Text style={[styles.secondaryText, { marginBottom: 10 }]}>{header}</Text>
            <PC
                data={data}
                width={500}
                height={200}
                chartConfig={chartConfig}
                accessor={'value'}
                backgroundColor={'transparent'}
                paddingLeft={'15'}
                center={[0, 0]}
                absolute
            />
        </View>
    );
}

export default PieChart;
