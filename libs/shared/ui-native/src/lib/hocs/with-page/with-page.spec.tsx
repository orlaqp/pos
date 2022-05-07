import React from 'react';
import { render } from '@testing-library/react-native';

import WithPage from './with-page';

describe('WithPage', () => {
    it('should render successfully', () => {
        const { container } = render(<WithPage />);
        expect(container).toBeTruthy();
    });
});
