import { authActions, authReducer, initialAuthState, signIn } from './auth.slice';

describe('auth reducer', () => {
  it('returns initial state', () => {
    expect(authReducer(undefined, { type: '' })).toEqual(initialAuthState);
  });

  it('handles signIn pending/fulfilled/rejected', () => {
    let state = authReducer(undefined, signIn.pending('', { email: 'a', password: 'b' }));
    expect(state.signInStatus).toBe('inProgress');

    state = authReducer(
      state,
      signIn.fulfilled(
        { id: '1', email: 'a@b.com', email_verified: true, name: 'A', groups: [] },
        '',
        { email: 'a', password: 'b' }
      )
    );
    expect(state.signInStatus).toBe('complete');
    expect(state.user?.id).toBe('1');

    state = authReducer(
      state,
      signIn.rejected(new Error('Uh oh'), '', { email: 'a', password: 'b' })
    );
    expect(state.signInStatus).toBe('error');
    expect(state.error).toBe('Uh oh');
  });

  it('handles logoff', () => {
    const state = authReducer(
      { ...initialAuthState, user: { id: '1' } as any },
      authActions.logoff()
    );
    expect(state.user).toBeUndefined();
  });
});
