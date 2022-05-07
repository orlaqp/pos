import React from 'react';
import { render } from '@testing-library/react-native';

import UIActions from './ui-actions';

describe('UiActionBar', () => {
    it('should render successfully', () => {
        // const { container } = render(<UIActions />);
        expect(container).toBeTruthy();
    });
});
