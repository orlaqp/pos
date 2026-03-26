import React from 'react';
import { render } from '@testing-library/react-native';

import UIKeyPad from './ui-key-pad';

describe('UIKeyPad', () => {
    it('should render successfully', () => {
        const { toJSON } = render(
            <UIKeyPad initialValue="" onChange={(value) => value} />
        );
        expect(toJSON()).toBeTruthy();
    });

    it('shows empty dots when no digits are entered', () => {
        const { getByTestId } = render(
            <UIKeyPad initialValue="" onChange={(value) => value} />
        );

        expect(getByTestId('ui-keypad-slot-0-empty')).toBeTruthy();
        expect(getByTestId('ui-keypad-slot-1-empty')).toBeTruthy();
        expect(getByTestId('ui-keypad-slot-2-empty')).toBeTruthy();
        expect(getByTestId('ui-keypad-slot-3-empty')).toBeTruthy();
    });

    it('shows ringed filled circles for entered digits', () => {
        const { getByTestId } = render(
            <UIKeyPad initialValue="12" onChange={(value) => value} />
        );

        expect(getByTestId('ui-keypad-slot-0-filled')).toBeTruthy();
        expect(getByTestId('ui-keypad-slot-1-filled')).toBeTruthy();
        expect(getByTestId('ui-keypad-slot-2-empty')).toBeTruthy();
        expect(getByTestId('ui-keypad-slot-3-empty')).toBeTruthy();
    });
});
