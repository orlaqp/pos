import { SignInRequest } from './definitions';
import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Auth } from 'aws-amplify';
import { CognitoUser } from '@aws-amplify/auth';


export const AUTH_FEATURE_KEY = 'auth';

/*
 * Update these interfaces according to your requirements.
 */
export interface User {
  email: string;
  name: string;
  sub: string;
}

export interface AuthState {
  user?: User;
  error?: string;
  signInStatus: 'inProgress' | 'complete' | 'error';
  isSignedIn: boolean;
}

export const signIn = createAsyncThunk(
  'auth/signInStatus',
  async (req: SignInRequest, thunkAPI) => {
    return Auth.signIn(req.email, req.password);
  }
);

export const initialAuthState: AuthState = {
  user: undefined,
  error: undefined,
  isSignedIn: false,
};

export const authSlice = createSlice({
  name: AUTH_FEATURE_KEY,
  initialState: initialAuthState,
  reducers: {
    loginRequired: (state) => { state.isSignedIn = false }
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state: AuthState) => {
        state.signInStatus = 'inProgress';
      })
      .addCase(
        signIn.fulfilled,
        (state: AuthState, action: PayloadAction<CognitoUser>) => {
          state.signInStatus = 'complete';
          const attrs = (action.payload as any).attributes;
          state.user = {
              email: attrs.email,
              name: attrs.name,
              sub: attrs.sub,
          };
        }
      )
      .addCase(signIn.rejected, (state: AuthState, action) => {
        state.signInStatus = 'error';
        state.error = action.error.message;
      });
  },
});

/*
 * Export reducer for store configuration.
 */
export const authReducer = authSlice.reducer;

/*
 * Export action creators to be dispatched. For use with the `useDispatch` hook.
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react';
 * import { useDispatch } from 'react-redux';
 *
 * // ...
 *
 * const dispatch = useDispatch();
 * useEffect(() => {
 *   dispatch(authActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const authActions = authSlice.actions;

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(selectAllAuth);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
// const { selectAll, selectEntities } = authAdapter.getSelectors();

export const getAuthState = (rootState: unknown): AuthState =>
  rootState[AUTH_FEATURE_KEY];

// export const selectAllAuth = createSelector(getAuthState, selectAll);

// export const selectAuthEntities = createSelector(getAuthState, selectEntities);
