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
    businessName?: string;
    tenantId: string;
}

export interface AuthState {
    user?: User;
    error?: string;
    signInStatus: 'not-started' | 'inProgress' | 'complete' | 'error';
    restoreStatus: 'not-started' | 'inProgress' | 'complete' | 'error';
}

const buildMessage = (error: unknown) =>
    error instanceof Error && error.message
        ? error.message
        : error &&
            typeof error === 'object' &&
            'message' in error &&
            typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : String(error);

const toUser = (currentUser: {
    attributes?: Record<string, unknown>;
    signInUserSession?: {
        accessToken?: {
            payload?: Record<string, unknown>;
        };
    };
}) => {
    const attrs = currentUser.attributes || {};
    const groups =
        currentUser?.signInUserSession?.accessToken?.payload?.[
            'cognito:groups'
        ];
    const tenantId = String(attrs.sub || '');

    return {
        id: tenantId,
        email: String(attrs.email || ''),
        email_verified: String(attrs.email_verified) === 'true',
        name: String(attrs.name || ''),
        businessName:
            typeof attrs['custom:businessName'] === 'string'
                ? attrs['custom:businessName']
                : undefined,
        tenantId,
        groups: Array.isArray(groups) ? groups : [],
    } as User;
};

export const signIn = createAsyncThunk(
    'auth/signInStatus',
    async (req: SignInRequest, thunkAPI) => {
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

            const currentUser = await Auth.currentAuthenticatedUser();
            return toUser(currentUser || signInResponse);
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

export const restoreSession = createAsyncThunk(
    'auth/restoreSession',
    async (_, thunkAPI) => {
        try {
            const currentUser = await Auth.currentAuthenticatedUser();
            return toUser(currentUser);
        } catch (error) {
            const message = buildMessage(error);

            if (
                message.includes('No current user') ||
                message.includes('not authenticated') ||
                message.includes('User needs to be authenticated') ||
                message.includes('User does not exist') ||
                message.includes('The user does not exist')
            ) {
                return thunkAPI.rejectWithValue('NO_SESSION');
            }

            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const initialAuthState: AuthState = {
    user: undefined,
    error: undefined,
    signInStatus: 'not-started',
    restoreStatus: 'not-started',
};

export const authSlice = createSlice({
    name: AUTH_FEATURE_KEY,
    initialState: initialAuthState,
    reducers: {
        logoff: (state: AuthState) => {
            state.user = undefined;
            state.error = undefined;
            state.signInStatus = 'not-started';
            state.restoreStatus = 'not-started';
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
                    state.restoreStatus = 'complete';
                    state.user = action.payload;
                }
            )
            .addCase(signIn.rejected, (state: AuthState, action) => {
                state.signInStatus = 'error';
                state.error =
                    typeof action.payload === 'string'
                        ? action.payload
                        : action.error?.message || 'Unable to sign in';
            })
            .addCase(restoreSession.pending, (state: AuthState) => {
                state.restoreStatus = 'inProgress';
            })
            .addCase(
                restoreSession.fulfilled,
                (state: AuthState, action: PayloadAction<User>) => {
                    state.restoreStatus = 'complete';
                    state.user = action.payload;
                    state.error = undefined;
                }
            )
            .addCase(restoreSession.rejected, (state: AuthState, action) => {
                state.restoreStatus = 'error';
                state.user = undefined;
                if (action.payload !== 'NO_SESSION') {
                    state.error =
                        typeof action.payload === 'string'
                            ? action.payload
                            : action.error?.message || 'Unable to restore session';
                }
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

export const selectAuthRestoreStatus = createSelector(
    getAuthState,
    (state: AuthState) => state.restoreStatus
);

// export const selectAuthEntities = createSelector(getAuthState, selectEntities);
