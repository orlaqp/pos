import { SignInRequest } from './definitions';
import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Auth } from 'aws-amplify';
import { CognitoUser } from '@aws-amplify/auth';

export const AUTH_FEATURE_KEY = 'auth';
export interface User {
  email: string;
  name: string;
  sub: string;
}

export interface AuthState {
  user?: User;
  error?: string;
  signInStatus: 'not-started' | 'inProgress' | 'complete' | 'error';
  isSignedIn: boolean;
}

export const signIn = createAsyncThunk(
  'auth/signInStatus',
  async (req: SignInRequest, thunkAPI) => {
    // return Auth.signIn(req.email, req.password);
    return {
        attributes: {
            email: '',
            name: 'attrs.name',
            sub: 'attrs.sub',
        }
    } as any;
  }
);

export const initialAuthState: AuthState = {
  user: undefined,
  error: undefined,
  signInStatus: 'not-started',
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
export const getAuthState = (rootState: unknown): AuthState =>
  rootState[AUTH_FEATURE_KEY];

// export const selectAllAuth = createSelector(getAuthState, selectAll);

// export const selectAuthEntities = createSelector(getAuthState, selectEntities);
