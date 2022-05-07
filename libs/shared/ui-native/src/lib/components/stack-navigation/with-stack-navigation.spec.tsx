import React from 'react';
import { render } from '@testing-library/react-native';

import StackNavigation from './stack-navigation';

describe('WithStackNavigation', () => {
    it('should render successfully', () => {
        const { container } = render(<StackNavigation />);
        expect(container).toBeTruthy();
    });
});
