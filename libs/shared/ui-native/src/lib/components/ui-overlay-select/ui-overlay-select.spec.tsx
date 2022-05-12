import React from 'react';
import { render } from '@testing-library/react-native';

import UiOverlaySelect from './ui-overlay-select';

describe('UiOverlaySelect', () => {
    it('should render successfully', () => {
        const { container } = render(<UiOverlaySelect />);
        expect(container).toBeTruthy();
    });
});
