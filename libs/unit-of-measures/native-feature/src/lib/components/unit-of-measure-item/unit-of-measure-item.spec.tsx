
import React from 'react';
import { render } from '@testing-library/react-native';

import UnitOfMeasureItem from './unit-of-measure-item';

describe('UnitOfMeasureItem', () => {
    it('should render successfully', () => {
        const { container } = render(<UnitOfMeasureItem />);
        expect(container).toBeTruthy();
    });
});
