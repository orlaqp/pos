import React from 'react';
import { render } from '@testing-library/react-native';

import EndOfDay from './end-of-day';

describe('EndOfDay', () => {
    it('should render successfully', () => {
        const { container } = render(<EndOfDay />);
        expect(container).toBeTruthy();
    });
});
