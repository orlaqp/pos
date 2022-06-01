import React, { useState } from 'react';

import moment from 'moment';

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateRangePicker from 'rn-select-date-range';
import { Icon, useTheme } from '@rneui/themed';
import { useSharedStyles } from '@pos/theme/native';

export interface DateRange {
    firstDate?: string;
    secondDate?: string;
}

/* eslint-disable-next-line */
export interface UIDateRangeProps {
    initialRange: DateRange;
    onRangeChange: (range: DateRange) => unknown;
}

export function UIDateRange({ initialRange, onRangeChange }: UIDateRangeProps) {
    const styles = useStyles();

    const [showDataRange, setShowDateRange] = useState<boolean>();
    const [selectedRange, setRange] = useState<DateRange>(initialRange);

    const updateDateRange = (range: DateRange) => {
        setRange(range);
        onRangeChange(range);
    };

    return (
        <View>
            <TouchableOpacity
                style={{
                    backgroundColor: styles.dataRow.backgroundColor,
                    padding: 15,
                    borderRadius: 5,
                    marginHorizontal: 10,
                }}
                onPress={() => setShowDateRange(!showDataRange)}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignContent: 'center',
                    }}
                >
                    <View>
                        <Icon
                            name="calendar-text"
                            type="material-community"
                            color={styles.secondaryText.color}
                        />
                    </View>
                    <View style={{ alignSelf: 'center', marginLeft: 20 }}>
                        {selectedRange && (
                            <Text style={{ color: styles.secondaryText.color }}>
                                {`${selectedRange.firstDate} - ${selectedRange.secondDate}`}
                            </Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
            {showDataRange && (
                <View style={[styles.container, { flex: 1 }]}>
                    <DateRangePicker
                        onSelectDateRange={(range) => {
                            updateDateRange(range);
                        }}
                        blockSingleDateSelection={true}
                        responseFormat="YYYY-MM-DD"
                        maxDate={moment()}
                        // minDate={moment().subtract(100, 'days')}
                        selectedDateContainerStyle={
                            styles.selectedDateContainerStyle
                        }
                        selectedDateStyle={styles.selectedDateStyle}
                        
                    />
                </View>
            )}
        </View>
    );
}

const useStyles = () => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            container: {
                margin: 50,
                backgroundColor: theme.theme.colors.grey0
            },
            selectedDateContainerStyle: {
                height: 35,
                width: '50%',
                borderRadius: 25,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.theme.colors.primary,
            },
            selectedDateStyle: {
                fontWeight: 'bold',
                color: 'white',
            },
        }),
    };
};

export default UIDateRange;
