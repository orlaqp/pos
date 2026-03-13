import React from 'react';
import { render } from '@testing-library/react-native';

import Products, { bootstrapProductsLookups, shouldFetchLookup } from './products';

describe('Products', () => {
    it('should render successfully', () => {
        const { container } = render(<Products />);
        expect(container).toBeTruthy();
    });

    it('decides lookup bootstrap based on loading status', () => {
        expect(shouldFetchLookup('new')).toBe(true);
        expect(shouldFetchLookup('loaded')).toBe(false);
        expect(shouldFetchLookup('error')).toBe(false);
    });

    it('dispatches only when lookup status is new', () => {
        const dispatch = jest.fn();
        const fetchAction = jest.fn(() => ({ type: 'lookup/fetch' }));

        bootstrapProductsLookups(dispatch, 'new', fetchAction);
        bootstrapProductsLookups(dispatch, 'loaded', fetchAction);

        expect(fetchAction).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({ type: 'lookup/fetch' });
    });
});
