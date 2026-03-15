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
});
