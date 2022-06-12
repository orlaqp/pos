import React from 'react';
import { render } from '@testing-library/react-native';

import LogList from './log-list';

describe('LogList', () => {
    it('should render successfully', () => {
        const { container } = render(<LogList />);
        expect(container).toBeTruthy();
    });
});
