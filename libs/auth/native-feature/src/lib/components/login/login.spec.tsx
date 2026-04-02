import React from 'react';
import { render } from '@testing-library/react-native';
import Login from './login';

const mockDispatch = jest.fn(() => ({
    unwrap: async () => undefined,
}));

jest.mock('react-redux', () => ({
    useSelector: (selector: (state: any) => unknown) =>
        selector({
            auth: {
                error: null,
                signInStatus: 'not-started',
            },
        }),
}));

jest.mock('@pos/store', () => ({
    useAppDispatch: () => mockDispatch,
}));

jest.mock('@pos/auth/data-access', () => ({
    signIn: jest.fn((payload: unknown) => payload),
    clearRememberedAdminCredentials: jest.fn(),
    getRememberedAdminCredentialStatus: jest.fn(async () => ({ enabled: false })),
    saveRememberedAdminCredentials: jest.fn(),
}));

describe('Login', () => {
  it('should render successfully', () => {
    const { root } = render(<Login navigation={{ navigate: jest.fn() } as any} />);
    expect(root).toBeTruthy();
  });
});
