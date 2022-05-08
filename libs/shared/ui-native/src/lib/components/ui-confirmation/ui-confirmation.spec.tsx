import React from 'react';
import { render } from '@testing-library/react-native';

import UiConfirmation from './ui-confirmation';

describe('UiConfirmation', () => {
    it('should render successfully', () => {
        const { container } = render(<UiConfirmation />);
        expect(container).toBeTruthy();
    });
});
