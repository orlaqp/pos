/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('react-redux', () => ({
    useSelector: jest.fn(() => [
        {
            id: 'event-1',
            event: 'Order search',
            timestamp: '2026-03-12T12:00:00.000Z',
            data: '{"filter":"0001"}',
        },
    ]),
}));

jest.mock('@pos/shared/data-store', () => ({
    selectAllEvents: jest.fn(),
}));

jest.mock('@pos/theme/native/design-tokens', () => ({
    useDesignTokens: () => ({
        spacing: { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16 },
        colors: {
            textPrimary: '#fff',
            textSecondary: '#aab6c2',
            textMuted: '#8491a2',
        },
    }),
}));

jest.mock('@pos/shared/ui-native', () => ({
    UIScreen: ({ children }: { children: React.ReactNode }) => {
        const { View: RNView } = require('react-native');
        return <RNView>{children}</RNView>;
    },
    UICard: ({ children }: { children: React.ReactNode }) => {
        const { View: RNView } = require('react-native');
        return <RNView>{children}</RNView>;
    },
    UIStack: ({ children }: { children: React.ReactNode }) => {
        const { View: RNView } = require('react-native');
        return <RNView>{children}</RNView>;
    },
}));

const { LogList } = require('./log-list');

describe('LogList', () => {
    it('should render successfully', () => {
        const { getByText } = render(<LogList />);
        expect(getByText('Order search')).toBeTruthy();
        expect(getByText('System Logs')).toBeTruthy();
    });
});
