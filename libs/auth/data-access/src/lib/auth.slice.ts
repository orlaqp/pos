import { SignInRequest } from './definitions';
import {
    createAsyncThunk,
    createSelector,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import { Auth } from '@pos/shared/amplify';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { RootState } from '@pos/store';

export const AUTH_FEATURE_KEY = 'auth';
export interface User {
    id: string;
    email_verified: boolean;
    name: string;
    email: string;
    groups: string[];
}

export interface AuthState {
    user?: User;
    error?: string;
    signInStatus: 'not-started' | 'inProgress' | 'complete' | 'error';
}

export const signIn = createAsyncThunk(
    'auth/signInStatus',
    async (req: SignInRequest, thunkAPI) => {
        const buildMessage = (error: unknown) =>
            error instanceof Error && error.message
                ? error.message
                : error &&
                    typeof error === 'object' &&
                    'message' in error &&
                    typeof (error as { message?: unknown }).message === 'string'
                  ? (error as { message: string }).message
                  : String(error);

        try {
            let signInResponse;

            try {
                signInResponse = await Auth.signIn(req.email, req.password);
            } catch (error) {
                const message = buildMessage(error);

                if (message === 'There is already a signed in user.') {
                    await Auth.signOut();
                    signInResponse = await Auth.signIn(req.email, req.password);
                } else {
                    throw error;
                }
            }

            const attrs = signInResponse.attributes;
            const currentUser = await Auth.currentAuthenticatedUser();
            const groups =
                currentUser?.signInUserSession?.accessToken?.payload[
                    'cognito:groups'
                ];

            return {
                id: attrs.sub,
                email: attrs.email,
                email_verified: String(attrs.email_verified) === 'true',
                name: attrs.name,
                groups: Array.isArray(groups) ? groups : [],
            } as User;
        } catch (error) {
            const message = buildMessage(error);

            console.error('signIn failed', error);
            if (error && typeof error === 'object') {
                console.error('signIn failed details', {
                    name: 'name' in error ? (error as { name?: unknown }).name : undefined,
                    message:
                        'message' in error ? (error as { message?: unknown }).message : undefined,
                    recoverySuggestion:
                        'recoverySuggestion' in error
                            ? (error as { recoverySuggestion?: unknown }).recoverySuggestion
                            : undefined,
                    underlyingError:
                        'underlyingError' in error
                            ? (error as { underlyingError?: unknown }).underlyingError
                            : undefined,
                    cause:
                        'cause' in error ? (error as { cause?: unknown }).cause : undefined,
                });
            }
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const initialAuthState: AuthState = {
    user: undefined,
    error: undefined,
    signInStatus: 'not-started',
};

export const authSlice = createSlice({
    name: AUTH_FEATURE_KEY,
    initialState: initialAuthState,
    reducers: {
        logoff: (state: AuthState) => {
            state.user = undefined;
            state.error = undefined;
            state.signInStatus = 'not-started';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(signIn.pending, (state: AuthState) => {
                state.signInStatus = 'inProgress';
                state.error = undefined;
            })
            .addCase(
                signIn.fulfilled,
                (state: AuthState, action: PayloadAction<User>) => {
                    state.signInStatus = 'complete';
                    state.user = action.payload;
                }
            )
            .addCase(signIn.rejected, (state: AuthState, action) => {
                state.signInStatus = 'error';
                state.error =
                    typeof action.payload === 'string'
                        ? action.payload
                        : action.error?.message || 'Unable to sign in';
            });
    },
});

/*
 * Export reducer for store configuration.
 */
export const authReducer = authSlice.reducer;
export const authActions = authSlice.actions;
export const getAuthState = (rootState: RootState): AuthState =>
    rootState[AUTH_FEATURE_KEY];

export const selectUser = createSelector(
    getAuthState,
    (state: AuthState) => state.user
);

export const selectEmployee = createSelector(
    getAuthState,
    (state: AuthState) => state.user
);   

// export const selectAuthEntities = createSelector(getAuthState, selectEntities);
