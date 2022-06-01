import { useSharedStyles } from '@pos/theme/native';
import React, { useState } from 'react';

import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

/* eslint-disable-next-line */
export interface LineChartProps {
    header: string;
}

export function LineChartComponent({ header }: LineChartProps) {
    const styles = useSharedStyles();
    const [width, setWidth] = useState<number>();

    return (
        <View
        style={{ width: '100%'}}
            onLayout={(event) => {
                const { x, y, width, height } = event.nativeEvent.layout;
                setWidth(width);
            }}
        >
            <Text style={[styles.secondaryText, { marginBottom: 10 }]}>{header}</Text>
            {!!width && (
                <LineChart
                    data={{
                        labels: [
                            'January',
                            'February',
                            'March',
                            'April',
                            'May',
                            'June',
                        ],
                        datasets: [
                            {
                                data: [
                                    Math.random() * 100,
                                    Math.random() * 100,
                                    Math.random() * 100,
                                    Math.random() * 100,
                                    Math.random() * 100,
                                    Math.random() * 100,
                                ],
                            },
                        ],
                    }}
                    width={width} // from react-native
                    height={220}
                    yAxisLabel="$"
                    yAxisSuffix="k"
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
