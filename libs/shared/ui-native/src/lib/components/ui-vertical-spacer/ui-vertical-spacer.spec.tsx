import React from 'react';
import { render } from '@testing-library/react-native';

import UiVerticalSpacer from './ui-vertical-spacer';

describe('UiVerticalSpacer', () => {
    it('should render successfully', () => {
        const { toJSON } = render(<UiVerticalSpacer size="medium" />);
        expect(toJSON()).toBeTruthy();
    });
});
