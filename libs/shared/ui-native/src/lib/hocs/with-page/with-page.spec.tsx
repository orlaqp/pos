import React from 'react';
import { render } from '@testing-library/react-native';

import WithPage from './with-page';

describe('WithPage', () => {
    it('should render successfully', () => {
        const Wrapped = WithPage(() => null);
        const { toJSON } = render(<Wrapped />);
        expect(toJSON()).toBeTruthy();
    });
});
