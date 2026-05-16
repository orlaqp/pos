import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AppErrorBoundary } from './app-error-boundary';

jest.mock('@pos/shared/utils', () => ({
    translateWithFallback: (_key: string, fallback: string) => fallback,
}));

const Thrower = () => {
    throw new Error('boom');
};

describe('AppErrorBoundary', () => {
    const originalError = console.error;

    beforeEach(() => {
        console.error = jest.fn();
    });

    afterEach(() => {
        console.error = originalError;
    });

    it('renders children when there is no crash', () => {
        const { getByText } = render(
            <AppErrorBoundary>
                <Text>Healthy screen</Text>
            </AppErrorBoundary>
        );

        expect(getByText('Healthy screen')).toBeTruthy();
    });

    it('shows fallback when a child crashes', () => {
        const { getByTestId, getByText } = render(
            <AppErrorBoundary>
                <Thrower />
            </AppErrorBoundary>
        );

        expect(getByTestId('app-crash-fallback')).toBeTruthy();
        expect(getByText('Something went wrong')).toBeTruthy();
    });

    it('allows retry from fallback UI', () => {
        const { getByText } = render(
            <AppErrorBoundary>
                <Thrower />
            </AppErrorBoundary>
        );

        fireEvent.press(getByText('Try Again'));
        expect(getByText('Something went wrong')).toBeTruthy();
    });
});
