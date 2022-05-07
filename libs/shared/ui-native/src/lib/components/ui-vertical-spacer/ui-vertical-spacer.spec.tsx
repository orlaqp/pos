import React from 'react';
import { render } from '@testing-library/react-native';

import UiVerticalSpacer from './ui-vertical-spacer';

describe('UiVerticalSpacer', () => {
    it('should render successfully', () => {
        const { container } = render(<UiVerticalSpacer />);
        expect(container).toBeTruthy();
    });
});
