import React from 'react';
import { render } from '@testing-library/react-native';

import UiLabel from './ui-label';

describe('UiLabel', () => {
    it('should render successfully', () => {
        const { container } = render(<UiLabel />);
        expect(container).toBeTruthy();
    });
});
