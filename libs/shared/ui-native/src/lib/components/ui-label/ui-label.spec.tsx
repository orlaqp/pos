import React from 'react';
import { render } from '@testing-library/react-native';

import { UILabel } from './ui-label';

describe('UiLabel', () => {
    it('should render successfully', () => {
        const { getByText } = render(<UILabel type="info" text="Info" />);
        expect(getByText('Info')).toBeTruthy();
    });
});
