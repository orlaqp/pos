import React from 'react';
import { render } from '@testing-library/react-native';

import UIInfo from './ui-info';

describe('UIInfo', () => {
    it('should render successfully', () => {
        const { container } = render(<UIInfo />);
        expect(container).toBeTruthy();
    });
});
