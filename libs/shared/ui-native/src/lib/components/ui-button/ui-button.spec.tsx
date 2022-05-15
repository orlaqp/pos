import React from 'react';
import { render } from '@testing-library/react-native';

import UIButton from './ui-button';

describe('UIButton', () => {
    it('should render successfully', () => {
        const { container } = render(<UIButton />);
        expect(container).toBeTruthy();
    });
});
