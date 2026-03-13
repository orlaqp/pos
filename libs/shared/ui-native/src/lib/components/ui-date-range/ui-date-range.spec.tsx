/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import moment from 'moment';

jest.mock('@pos/theme/native', () => ({
    useSharedStyles: () => ({
        page: {},
    }),
}));

jest.mock('react-native-date-picker', () => {
    const React = require('react');
    const { Pressable, Text } = require('react-native');

    return ({ onConfirm }) => (
        <Pressable
            testID="mock-date-picker-confirm"
            onPress={() => onConfirm(new Date('2026-03-10T00:00:00.000Z'))}
        >
            <Text>confirm</Text>
        </Pressable>
    );
});

const { UIDateRange } = require('./ui-date-range');

describe('UIDateRange', () => {
    it('should render successfully', () => {
        const onRangeChange = jest.fn();
        const initialRange = {
            startDate: moment('2026-03-13').startOf('day'),
            endDate: moment('2026-03-13').endOf('day'),
        };

        const { getByTestId } = render(
            <UIDateRange initialRange={initialRange} onRangeChange={onRangeChange} />
        );
        fireEvent.press(getByTestId('ui-date-range-LAST_7_DAYS'));

        expect(getByTestId('ui-date-range')).toBeTruthy();
        expect(onRangeChange).toHaveBeenCalledTimes(1);
    });

    it('applies a custom range automatically on date pick', () => {
        const onRangeChange = jest.fn();
        const initialRange = {
            startDate: moment('2026-03-13').startOf('day'),
            endDate: moment('2026-03-13').endOf('day'),
        };

        const { getByTestId, getAllByTestId } = render(
            <UIDateRange initialRange={initialRange} onRangeChange={onRangeChange} />
        );

        fireEvent.press(getByTestId('ui-date-range-CUSTOM'));
        fireEvent.press(getByTestId('ui-date-range-custom-start-picker'));
        fireEvent.press(getAllByTestId('mock-date-picker-confirm')[0]);

        expect(onRangeChange).toHaveBeenCalledWith(
            expect.objectContaining({
                startDate: expect.any(Object),
                endDate: expect.any(Object),
            })
        );
    });
});
