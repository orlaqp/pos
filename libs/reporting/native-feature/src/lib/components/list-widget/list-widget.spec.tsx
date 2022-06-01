import React from 'react';
import { render } from '@testing-library/react-native';

import ListWidget from './list-widget';

describe('ListWidget', () => {
    it('should render successfully', () => {
        const { container } = render(<ListWidget />);
        expect(container).toBeTruthy();
    });
});
