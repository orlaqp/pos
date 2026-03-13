import React from 'react';
import { render } from '@testing-library/react-native';

import UIInfo from './ui-info';

describe('UIInfo', () => {
    it('should render successfully', () => {
        const { getByText } = render(<UIInfo primary="A" secondary="B" />);
        expect(getByText('A')).toBeTruthy();
        expect(getByText('B')).toBeTruthy();
    });
});
