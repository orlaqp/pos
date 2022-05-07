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
    id: string;
    email_verified: boolean;
    given_name: string;
    family_name: string;
    email: string;
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
        const signInResponse = await Auth.signIn(req.email, req.password);
        const attrs = signInResponse.attributes;

        return {
            id: attrs.sub,
            email: attrs.email,
            email_verified: attrs.email_verified,
            family_name: attrs.family_name,
            given_name: attrs.given_name,
        }
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
                (state: AuthState, action: PayloadAction<User>) => {
                    debugger;
                    state.signInStatus = 'complete';
                    state.user = action.payload;
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
