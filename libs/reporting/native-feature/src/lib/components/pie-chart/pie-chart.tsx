import { useSharedStyles } from '@pos/theme/native';
import React, { useState } from 'react';

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

// const data = [
//     {
//         name: 'Seoul',
//         value: 21500000,
//         color: '#1976d2',
//         legendFontColor: '#7F7F7F',
//         legendFontSize: 15,
//     },
//     {
//         name: 'Toronto',
//         value: 2800000,
//         color: '#e91e63',
//         legendFontColor: '#7F7F7F',
//         legendFontSize: 15,
//     },
//     {
//         name: 'Beijing',
//         value: 527612,
//         color: '#43a047',
//         legendFontColor: '#00796b',
//         legendFontSize: 15,
//     },
//     {
//         name: 'New York',
//         value: 8538000,
//         color: '#6d4c41',
//         legendFontColor: '#7F7F7F',
//         legendFontSize: 15,
//     },
//     {
//         name: 'Moscow',
//         value: 11920000,
//         color: '#f57c00',
//         legendFontColor: '#7F7F7F',
//         legendFontSize: 15,
//     },
// ];

export function PieChart({ header, items }: PieChartProps) {
    const styles = useSharedStyles();
    const [width, setWidth] = useState<number>();
    const chartConfig = {
        backgroundGradientFrom: "#1E2923",
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: "#08130D",
        backgroundGradientToOpacity: 0.5,
        color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
        strokeWidth: 2, // optional, default 3
        barPercentage: 0.5,
        useShadowColorFromDataset: false // optional
      };

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
        <View
            onLayout={(event) => {
                const { x, y, width, height } = event.nativeEvent.layout;
                setWidth(width);
            }}
        >
                <Text style={[styles.secondaryText, { marginBottom: 10 }]}>{header}</Text>
                <PC
                    data={data}
                    width={400}
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
