import React from 'react';
import { render } from '@testing-library/react-native';

import Widget from './widget';

describe('Widget', () => {
    it('should render successfully', () => {
        const { container } = render(<Widget />);
        expect(container).toBeTruthy();
    });
});
