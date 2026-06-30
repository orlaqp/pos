import * as React from 'react';
import { render } from '@testing-library/react-native';

import App from './App';

jest.mock('@pos/shared/amplify', () => ({
    Auth: {
        currentAuthenticatedUser: jest.fn(),
        signOut: jest.fn(),
    },
    DataStore: {
        clear: jest.fn(),
        configure: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
    },
    getCurrentGraphqlEndpoint: jest.fn(() => 'test-endpoint'),
    getDataStoreLifecycleState: jest.fn(() => 'started'),
    handleDataStoreUnauthorizedError: jest.fn(() => false),
    setDataStoreUnauthorizedHandler: jest.fn(),
    syncExpression: jest.fn((model, builder) => ({ model, builder })),
}));

test('renders correctly', () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toBeTruthy();
});
