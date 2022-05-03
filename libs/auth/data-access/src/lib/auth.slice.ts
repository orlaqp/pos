import { SignUpRequest } from './definitions';
import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Auth } from 'aws-amplify';


export const AUTH_FEATURE_KEY = 'auth';

/*
 * Update these interfaces according to your requirements.
 */
export interface UserEntity {
  id: number;
}

export interface AuthState {
  user?: UserEntity;
  error?: string;
  isSignedIn: boolean;
}

export const signUp = createAsyncThunk(
  'auth/signUpStatus',
  async (req: SignUpRequest, thunkAPI) => {
    const res = await Auth.signUp({
        username: req.email,
        password: req.password,
        attributes: {
          name: req.name,
        },
    });
    return ;
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
    // builder
    //   .addCase(signUp.pending, (state: AuthState) => {
    //     state.signupStatus = 'loading';
    //   })
    //   .addCase(
    //     signUp.fulfilled,
    //     (state: AuthState, action: PayloadAction<UserEntity[]>) => {
    //       authAdapter.setAll(state, action.payload);
    //       state.signupStatus = 'loaded';
    //     }
    //   )
    //   .addCase(signUp.rejected, (state: AuthState, action) => {
    //     state.signupStatus = 'error';
    //     state.error = action.error.message;
    //   });
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
