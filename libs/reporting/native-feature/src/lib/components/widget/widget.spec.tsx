import React from 'react';
import { render } from '@testing-library/react-native';

import Widget from './widget';

describe('Widget', () => {
    it('should render successfully', () => {
        const { UNSAFE_root } = render(<Widget />);
        expect(UNSAFE_root).toBeTruthy();
    });
});
