import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@pos/store';

export const TENANT_SESSION_FEATURE_KEY = 'tenantSession';

export interface TenantSessionState {
    currentTenantId?: string;
    businessName?: string;
    bootstrapStatus: 'idle' | 'restoring' | 'bootstrapping' | 'ready' | 'error';
    error?: string;
}

const initialState: TenantSessionState = {
    currentTenantId: undefined,
    businessName: undefined,
    bootstrapStatus: 'idle',
    error: undefined,
};

export const tenantSessionSlice = createSlice({
    name: TENANT_SESSION_FEATURE_KEY,
    initialState,
    reducers: {
        setTenantSession: (
            state,
            action: PayloadAction<{ tenantId: string; businessName?: string }>
        ) => {
            state.currentTenantId = action.payload.tenantId;
            state.businessName = action.payload.businessName;
            state.error = undefined;
        },
        setBootstrapStatus: (
            state,
            action: PayloadAction<TenantSessionState['bootstrapStatus']>
        ) => {
            state.bootstrapStatus = action.payload;
        },
        setTenantSessionError: (state, action: PayloadAction<string | undefined>) => {
            state.error = action.payload;
            if (action.payload) {
                state.bootstrapStatus = 'error';
            }
        },
        clearTenantSession: (state) => {
            state.currentTenantId = undefined;
            state.businessName = undefined;
            state.bootstrapStatus = 'idle';
            state.error = undefined;
        },
    },
});

export const tenantSessionReducer = tenantSessionSlice.reducer;
export const tenantSessionActions = tenantSessionSlice.actions;

export const getTenantSessionState = (rootState: RootState): TenantSessionState =>
    rootState[TENANT_SESSION_FEATURE_KEY];

export const selectTenantSession = createSelector(
    getTenantSessionState,
    (state) => state
);

export const selectCurrentTenantId = createSelector(
    getTenantSessionState,
    (state) => state.currentTenantId
);
