import React from 'react';
import { render } from '@testing-library/react-native';

import UiSwitch from './ui-switch';

describe('UiSwitch', () => {
    it('should render successfully', () => {
        const { container } = render(<UiSwitch />);
        expect(container).toBeTruthy();
    });
});
