import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import UIScreen from './ui-screen';

describe('UIScreen', () => {
    it('renders children', () => {
        const { getByText } = render(
            <UIScreen padded>
                <Text>screen content</Text>
            </UIScreen>
        );

        expect(getByText('screen content')).toBeTruthy();
    });
});
