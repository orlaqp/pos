import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import UIButton from './ui-button';

describe('UIButton', () => {
    it('should render successfully', () => {
        const { toJSON } = render(
            <UIButton
                item={{ id: '1', name: 'Button' }}
                onSelected={jest.fn()}
            />
        );
        expect(toJSON()).toBeTruthy();
    });

    it('supports long press callbacks', () => {
        const onSelected = jest.fn();
        const onLongPress = jest.fn();
        const { getByText } = render(
            <UIButton
                item={{ id: '1', name: 'Button' }}
                onSelected={onSelected}
                onLongPress={onLongPress}
            />
        );

        fireEvent(getByText('Button'), 'longPress');
        expect(onLongPress).toHaveBeenCalledWith({ id: '1', name: 'Button' });
        expect(onSelected).not.toHaveBeenCalled();
    });
});
