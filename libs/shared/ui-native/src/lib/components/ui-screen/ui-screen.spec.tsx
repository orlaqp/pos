import React from 'react';
import { render } from '@testing-library/react-native';
import { ScrollView, StyleSheet, Text } from 'react-native';

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

    it('allows scroll content to grow past the viewport', () => {
        const { UNSAFE_getByType } = render(
            <UIScreen scroll>
                <Text>long screen content</Text>
            </UIScreen>
        );

        const scrollView = UNSAFE_getByType(ScrollView);
        expect(
            StyleSheet.flatten(scrollView.props.contentContainerStyle)
        ).toEqual(expect.objectContaining({ flexGrow: 1 }));
        expect(
            StyleSheet.flatten(scrollView.props.contentContainerStyle)
        ).not.toEqual(expect.objectContaining({ flex: 1 }));
    });
});
