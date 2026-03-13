import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import StackNavigation from './stack-navigation';

describe('WithStackNavigation', () => {
    it('should render successfully', () => {
        const MockStack: any = {
            Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        };
        const { getByText } = render(
            <StackNavigation Stack={MockStack}>
                <Text>Screen</Text>
            </StackNavigation>
        );
        expect(getByText('Screen')).toBeTruthy();
    });
});
