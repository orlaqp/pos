import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import UICard from './ui-card';

describe('UICard', () => {
    it('renders children successfully', () => {
        const { getByText } = render(
            <UICard>
                <Text>Card body</Text>
            </UICard>
        );

        expect(getByText('Card body')).toBeTruthy();
    });
});
