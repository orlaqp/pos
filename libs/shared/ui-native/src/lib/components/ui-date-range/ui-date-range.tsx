import React, { useMemo, useState } from 'react';
import moment from 'moment';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { UIDatePickerModal } from '../ui-date-picker-modal/ui-date-picker-modal';

export interface DateRange {
    startDate: moment.Moment;
    endDate: moment.Moment;
}

export interface UIDateRangeProps {
    initialRange: DateRange;
    onRangeChange: (range: DateRange) => unknown;
    rightAction?: React.ReactNode;
    showSummary?: boolean;
}

type RangePreset = 'TODAY' | 'LAST_7_DAYS' | 'THIS_MONTH' | 'CUSTOM';

const buildPresetRange = (preset: RangePreset): DateRange => {
    if (preset === 'LAST_7_DAYS') {
        return {
            startDate: moment().subtract(6, 'days').startOf('day'),
            endDate: moment().endOf('day'),
        };
    }

    if (preset === 'THIS_MONTH') {
        return {
            startDate: moment().startOf('month'),
            endDate: moment().endOf('day'),
        };
    }

    return {
        startDate: moment().startOf('day'),
        endDate: moment().endOf('day'),
    };
};

export function UIDateRange({
    initialRange,
    onRangeChange,
    rightAction,
    showSummary = true,
}: UIDateRangeProps) {
    const styles = useStyles();
    const [selectedPreset, setSelectedPreset] = useState<RangePreset>('TODAY');
    const [rangeLabel, setRangeLabel] = useState(
        `${initialRange.startDate.format('MM-DD-YYYY')}  ->  ${initialRange.endDate.format(
            'MM-DD-YYYY'
        )}`
    );
    const [customStartDate, setCustomStartDate] = useState(
        initialRange.startDate.toDate()
    );
    const [customEndDate, setCustomEndDate] = useState(
        initialRange.endDate.toDate()
    );
    const [startPickerOpen, setStartPickerOpen] = useState(false);
    const [endPickerOpen, setEndPickerOpen] = useState(false);
    const [customError, setCustomError] = useState<string>('');

    const presets = useMemo(
        () => [
            { key: 'TODAY' as const, title: 'Today' },
            { key: 'LAST_7_DAYS' as const, title: 'Last 7 Days' },
            { key: 'THIS_MONTH' as const, title: 'This Month' },
            { key: 'CUSTOM' as const, title: 'Custom' },
        ],
        []
    );

    const applyPreset = (preset: RangePreset) => {
        if (preset === 'CUSTOM') {
            setSelectedPreset('CUSTOM');
            applyCustomRange(customStartDate, customEndDate);
            return;
        }

        const nextRange = buildPresetRange(preset);
        setSelectedPreset(preset);
        setCustomError('');
        setCustomStartDate(nextRange.startDate.toDate());
        setCustomEndDate(nextRange.endDate.toDate());
        setRangeLabel(
            `${nextRange.startDate.format('MM-DD-YYYY')}  ->  ${nextRange.endDate.format(
                'MM-DD-YYYY'
            )}`
        );
        onRangeChange(nextRange);
    };

    const applyCustomRange = (startDate: Date, endDate: Date) => {
        const start = moment(startDate);
        const end = moment(endDate);

        if (start.isAfter(end, 'day')) {
            setCustomError('Start date must be before or equal to end date.');
            return;
        }

        const nextRange = {
            startDate: start.startOf('day'),
            endDate: end.endOf('day'),
        };

        setCustomError('');
        setCustomStartDate(nextRange.startDate.toDate());
        setCustomEndDate(nextRange.endDate.toDate());
        setRangeLabel(
            `${nextRange.startDate.format('MM-DD-YYYY')}  ->  ${nextRange.endDate.format(
                'MM-DD-YYYY'
            )}`
        );
        onRangeChange(nextRange);
    };

    return (
        <View style={styles.container} testID="ui-date-range">
            <View style={styles.selectorRow}>
                <View style={styles.actionsRow}>
                    {presets.map((preset) => (
                        <Pressable
                            key={preset.key}
                            testID={`ui-date-range-${preset.key}`}
                            style={[
                                styles.button,
                                selectedPreset === preset.key
                                    ? styles.buttonActive
                                    : styles.buttonInactive,
                            ]}
                            onPress={() => applyPreset(preset.key)}
                        >
                            <Text
                                style={[
                                    styles.buttonText,
                                    selectedPreset === preset.key
                                        ? styles.buttonTextActive
                                        : styles.buttonTextInactive,
                                ]}
                            >
                                {preset.title}
                            </Text>
                        </Pressable>
                    ))}
                    {selectedPreset === 'CUSTOM' && (
                        <View testID="ui-date-range-custom-panel">
                            <View style={styles.customInputRow}>
                                <Pressable
                                    testID="ui-date-range-custom-start-picker"
                                    onPress={() => setStartPickerOpen(true)}
                                    style={[styles.pickButton, styles.pickButtonSpaced]}
                                >
                                    <Text style={styles.pickButtonText}>
                                        {moment(customStartDate).format('MM-DD-YYYY')}
                                    </Text>
                                </Pressable>
                                <Pressable
                                    testID="ui-date-range-custom-end-picker"
                                    onPress={() => setEndPickerOpen(true)}
                                    style={[styles.pickButton, styles.pickButtonSpaced]}
                                >
                                    <Text style={styles.pickButtonText}>
                                        {moment(customEndDate).format('MM-DD-YYYY')}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    )}
                </View>
                <View style={styles.spacer} />
                {!!rightAction && <View style={styles.rightActionWrap}>{rightAction}</View>}
            </View>
            {showSummary && (
                <View style={styles.summaryPill} testID="ui-date-range-summary">
                    <Text style={styles.summaryText}>{rangeLabel}</Text>
                </View>
            )}
            {!!customError && <Text style={styles.customError}>{customError}</Text>}
            <UIDatePickerModal
                mode="date"
                open={startPickerOpen}
                date={customStartDate}
                title="Select start date"
                onConfirm={(date) => {
                    setStartPickerOpen(false);
                    setCustomStartDate(date);
                    applyCustomRange(date, customEndDate);
                }}
                onCancel={() => setStartPickerOpen(false)}
            />
            <UIDatePickerModal
                mode="date"
                open={endPickerOpen}
                date={customEndDate}
                title="Select end date"
                onConfirm={(date) => {
                    setEndPickerOpen(false);
                    setCustomEndDate(date);
                    applyCustomRange(customStartDate, date);
                }}
                onCancel={() => setEndPickerOpen(false)}
            />
        </View>
    );
}

const useStyles = () => {
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            container: {
                alignItems: 'center',
                paddingVertical: 12,
            },
            actionsRow: {
                flexDirection: 'row',
                alignItems: 'center',
            },
            selectorRow: {
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
            },
            rightActionWrap: {
                marginLeft: 0,
            },
            spacer: {
                flex: 1,
            },
            customInputRow: {
                flexDirection: 'row',
                alignItems: 'center',
            },
            pickButton: {
                borderRadius: 6,
                borderWidth: 1,
                borderColor: '#3b82f6',
                paddingHorizontal: 10,
                paddingVertical: 6,
                backgroundColor: '#1f2937',
            },
            pickButtonSpaced: {
                marginLeft: 6,
            },
            pickButtonText: {
                color: '#93c5fd',
                fontSize: 12,
                fontWeight: '700',
            },
            summaryPill: {
                marginTop: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: '#334155',
                backgroundColor: '#111827',
                paddingHorizontal: 12,
                paddingVertical: 5,
                alignSelf: 'center',
            },
            summaryText: {
                color: '#cbd5e1',
                fontWeight: '700',
                fontSize: 12,
                letterSpacing: 0.2,
            },
            customError: {
                marginTop: 8,
                color: '#f59e0b',
                fontSize: 12,
                fontWeight: '600',
                alignSelf: 'flex-end',
            },
            button: {
                marginHorizontal: 4,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderWidth: 1,
            },
            buttonActive: {
                backgroundColor: '#3b82f6',
                borderColor: '#3b82f6',
            },
            buttonInactive: {
                backgroundColor: 'transparent',
                borderColor: '#4b5563',
            },
            buttonText: {
                fontSize: 13,
                fontWeight: '600',
            },
            buttonTextActive: {
                color: '#ffffff',
            },
            buttonTextInactive: {
                color: '#cbd5e1',
            },
        }),
    };
};

export default UIDateRange;
