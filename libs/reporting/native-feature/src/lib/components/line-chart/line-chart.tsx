import { useSharedStyles } from '@pos/theme/native';
import React, { useState } from 'react';

import { View, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

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
    const [width, setWidth] = useState<number>();

    if (!data?.length)
        return (
            <View style={styles.centered}>
                <Text style={styles.secondaryText}>No data provided</Text>
            </View>
        );

    const parsedData = toLineChartDataset(data);

    return (
        <View
            testID="line-chart-container"
            style={{ width: '100%' }}
            onLayout={(event) => {
                const { width } = event.nativeEvent.layout;
                setWidth(width);
            }}
        >
            <Text style={[styles.secondaryText, { marginBottom: 10 }]}>
                {header}
            </Text>
            {!!width && (
                <LineChart
                    data={parsedData}
                    width={width} // from react-native
                    height={220}
                    yAxisLabel="$"
                    yAxisSuffix=""
                    yAxisInterval={1} // optional, defaults to 1
                    chartConfig={buildLineChartConfig(styles.secondaryText.color)}
                    bezier
                    style={{
                        marginVertical: 8,
                        borderRadius: 5,
                    }}
                />
            )}
        </View>
    );
}

export default LineChart;
