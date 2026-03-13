import { useSharedStyles } from '@pos/theme/native';
import React from 'react';

import { View, Text } from 'react-native';
import { PieChart as PC } from 'react-native-chart-kit';

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

    if (!items?.length)
      return (
          <View style={styles.centered}>
              <Text style={styles.secondaryText}>No data provided</Text>
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
