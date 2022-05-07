import React from 'react';
import { render } from '@testing-library/react-native';

import WithPage from './with-centered-page';

describe('WithPage', () => {
    it('should render successfully', () => {
        // const { container } = render(<withCenteredPage />);
        expect(container).toBeTruthy();
    });
});
