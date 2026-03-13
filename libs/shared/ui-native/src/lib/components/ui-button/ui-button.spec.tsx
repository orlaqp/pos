import React from 'react';
import { render } from '@testing-library/react-native';

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
});
