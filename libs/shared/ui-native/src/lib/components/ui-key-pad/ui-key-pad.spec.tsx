import React from 'react';
import { render } from '@testing-library/react-native';

import UIKeyPad from './ui-key-pad';

describe('UIKeyPad', () => {
    it('should render successfully', () => {
        const { container } = render(<UIKeyPad />);
        expect(container).toBeTruthy();
    });
});
