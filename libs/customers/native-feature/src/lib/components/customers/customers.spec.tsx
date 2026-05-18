import React from 'react';
import { render } from '@testing-library/react-native';

import Customers from './customers';

jest.mock('@pos/shared/ui-native', () => ({
    StackNavigation: ({ children }: { children: React.ReactNode }) =>
        children as React.ReactElement,
}));

describe('Customers', () => {
    it('uses the same stack navigation pattern as Employees', () => {
        const { UNSAFE_getAllByType } = render(<Customers />);

        expect(UNSAFE_getAllByType(Customers.Screen).map((screen) => screen.props.name)).toEqual([
            'Customer List',
            'Customer Form',
            'Customer Payment',
        ]);
    });
});
