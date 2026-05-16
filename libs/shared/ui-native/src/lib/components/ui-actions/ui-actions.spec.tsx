import React from 'react';
import { render } from '@testing-library/react-native';

import UIActions from './ui-actions';

describe('UiActionBar', () => {
    it('should render successfully', () => {
        const { toJSON } = render(
            <UIActions
                busy={false}
                submitAction={jest.fn()}
                cancelAction={jest.fn()}
            />
        );
        expect(toJSON()).toBeTruthy();
    });
});
