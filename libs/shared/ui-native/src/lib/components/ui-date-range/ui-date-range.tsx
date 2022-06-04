import React, { useState } from 'react';

import moment from 'moment';

import { View, Text, StyleSheet } from 'react-native';
import { Icon, useTheme } from '@rneui/themed';
import { useSharedStyles } from '@pos/theme/native';
import DateRangePicker from 'react-native-daterange-picker';

export interface DateRange {
    startDate: moment.Moment;
    endDate: moment.Moment;
}

export interface UIDateRangeProps {
    initialRange: DateRange;
    onRangeChange: (range: DateRange) => unknown;
}

export function UIDateRange({ initialRange, onRangeChange }: UIDateRangeProps) {
    const styles = useStyles();
    const [startDate, setStartDate] = useState<moment.Moment>(
        initialRange.startDate
    );
    const [endDate, setEndDate] = useState<moment.Moment>(initialRange.endDate);
    const [displayedDate, setDisplayedDate] = useState(initialRange.startDate);

    const setDates = (value: {
        displayedDate: moment.Moment;
        startDate: moment.Moment;
        endDate: moment.Moment;
    }) => {
        const range = {
            startDate: startDate,
            endDate: endDate,
        };

        if (value.displayedDate) setDisplayedDate(value.displayedDate);
        if (value.startDate) {
            setStartDate(value.startDate);
            range.startDate = value.startDate;
        }
        if (value.endDate) {
            setEndDate(value.endDate);
            range.endDate = value.endDate;
        }

        if (value.endDate && range.startDate && range.endDate) {
            onRangeChange(range);
        }
    };

    return (
        <View style={styles.container}>
            <DateRangePicker
                onChange={setDates}
                endDate={endDate}
                startDate={startDate}
                displayedDate={displayedDate}
                range
                containerStyle={{ paddingHorizontal: 40, paddingVertical: 20 }}
            >
                <View
                    style={{
                        backgroundColor: styles.dataRow.backgroundColor,
                        padding: 15,
                        borderRadius: 5,
                        marginHorizontal: 10,
                    }}
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
                            {startDate && (
                                <Text
                                    style={{
                                        color: styles.primaryText.color,
                                        fontWeight: 'bold',
                                        fontSize: 18,
                                    }}
                                >
                                    {`${startDate.format(
                                        'YYYY-MM-DD'
                                    )}  ->  ${endDate?.format('YYYY-MM-DD')}`}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            </DateRangePicker>
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
                flex: 1,
                zIndex: 10,
                // backgroundColor: "#fff",
                alignItems: 'center',
                // marginTop: -100,
                padding: 15,
                // justifyContent: "center",
                // margin: 50,
                backgroundColor: 'transparent'
                    // theme.theme.mode === 'dark'
                    //     ? theme.theme.colors.white
                    //     : theme.theme.colors.grey5,
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
