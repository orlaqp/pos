import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import UIStack from './ui-stack';

describe('UIStack', () => {
    it('renders all children in order', () => {
        const { getByText } = render(
            <UIStack spacing="lg">
                <Text>First</Text>
                <Text>Second</Text>
            </UIStack>
        );

        expect(getByText('First')).toBeTruthy();
        expect(getByText('Second')).toBeTruthy();
    });
});
