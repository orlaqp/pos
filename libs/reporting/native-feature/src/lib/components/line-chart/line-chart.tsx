import { useSharedStyles } from '@pos/theme/native';
import React, { useState } from 'react';

import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export interface LineChartItem {
    label: string;
    values: number[];
}

export interface LineChartProps {
    header: string;
    data: LineChartItem[];
}

export function LineChartComponent({ header, data }: LineChartProps) {
    const styles = useSharedStyles();
    const [width, setWidth] = useState<number>();

    if (!data?.length)
        return (
            <View style={styles.centered}>
                <Text style={styles.secondaryText}>No data provided</Text>
            </View>
        );

    const parsedData: { labels: string[]; datasets: { data: number[] }[] } = {
        labels: [],
        datasets: data[0].values.map(v => ({ data: [] })),
    };

    data.reduce((d, item) => {
        d.labels.push(item.label);
        item.values.forEach((v, idx) => d.datasets[idx].data.push(v))
        return d;
    }, parsedData);

    return (
        <View
            style={{ width: '100%' }}
            onLayout={(event) => {
                const { x, y, width, height } = event.nativeEvent.layout;
                setWidth(width);
            }}
        >
            <Text style={[styles.secondaryText, { marginBottom: 10 }]}>
                {header}
            </Text>
            {!!width && (
                <LineChart
                    data={parsedData}
                    // data={{
                    //     labels: [
                    //         'January',
                    //         'February',
                    //         'March',
                    //         'April',
                    //         'May',
                    //         'June',
                    //         'July',
                    //         'Aug',
                    //         'Sept',
                    //         'Oct',
                    //         'Nov',
                    //         'Dec',
                    //         'Oct',
                    //         'Nov',
                    //         'Dec',
                    //     ],
                    //     datasets: [
                    //         {
                    //             data: [
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //             ],
                    //         },
                    //     ],
                    // }}
                    width={width} // from react-native
                    height={220}
                    yAxisLabel="$"
                    yAxisSuffix=""
                    yAxisInterval={1} // optional, defaults to 1
                    chartConfig={{
                        // backgroundColor: '#e26a00',
                        // backgroundGradientFrom: '#fb8c00',
                        // backgroundGradientTo: '#ffa726',
                        backgroundGradientFrom: `transparent`,
                        backgroundGradientTo: `transparent`,
                        decimalPlaces: 2, // optional, defaults to 2dp
                        color: (opacity = 1) => styles.secondaryText.color,
                        labelColor: (opacity = 1) => styles.secondaryText.color,
                        style: {
                            borderRadius: 2,
                        },
                        propsForDots: {
                            r: '6',
                            strokeWidth: '2',
                            stroke: '#ffa726',
                        },
                    }}
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
