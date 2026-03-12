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

const { LogList } = require('./log-list');

describe('LogList', () => {
    it('should render successfully', () => {
        const { getByText } = render(<LogList />);
        expect(getByText('Order search')).toBeTruthy();
    });
});
