import React from 'react';
import { render } from '@testing-library/react-native';
import Login from './login';

jest.mock('react-redux', () => ({
    useDispatch: () => jest.fn(),
    useSelector: (selector: (state: any) => unknown) =>
        selector({
            auth: {
                error: null,
                signInStatus: 'idle',
            },
        }),
}));

describe('Login', () => {
  it('should render successfully', () => {
    const { container } = render(<Login />);
    expect(container).toBeTruthy();
  });
});
