import {
    createAsyncThunk,
    createSelector,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import {
    selectPreferredStore,
    StoreInfoEntity,
    StoreInfoEntityMapper,
} from './store-info.entity';
import DeviceInfo from 'react-native-device-info';
import { StoreInfoService } from './store-info.service';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { RootState } from '@pos/store';

export const STORE_INFO_FEATURE_KEY = 'storeInfo';
const deviceId = DeviceInfo.getUniqueIdSync();

export interface StoreInfoState {
    deviceId: string;
    loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
    store?: StoreInfoEntity;
    error?: string;
    initialSyncComplete: boolean;
}

const getRejectedErrorMessage = (error: unknown) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    if (error && typeof error === 'object') {
        const message = (error as { message?: unknown }).message;
        if (typeof message === 'string' && message.length > 0) {
            return message;
        }

        const errors = (error as { errors?: Array<{ message?: unknown }> }).errors;
        const messages = errors
            ?.map((entry) => entry?.message)
            .filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
        if (messages?.length) {
            return messages.join(' | ');
        }

        try {
            return JSON.stringify(error);
        } catch {
            return 'Failed to load store info';
        }
    }

    return 'Failed to load store info';
};

export const fetchStoreInfo = createAsyncThunk(
    'storeInfo/fetchStatus',
    async (_, thunkAPI) => {
        try {
            const stores = await StoreInfoService.getStore();
            const preferredStore = selectPreferredStore(stores);

            return {
                store: preferredStore
                    ? StoreInfoEntityMapper.fromModel(preferredStore)
                    : undefined,
                initialSyncComplete: true,
            };
        } catch (error) {
            return thunkAPI.rejectWithValue(getRejectedErrorMessage(error));
        }
    }
);

export const initialStoreInfoState: StoreInfoState = {
    deviceId,
    loadingStatus: 'not loaded',
    error: undefined,
    store: undefined,
    initialSyncComplete: false,
};

export const storeInfoSlice = createSlice({
    name: STORE_INFO_FEATURE_KEY,
    initialState: initialStoreInfoState,
    reducers: {
        set: (state: StoreInfoState, action: PayloadAction<StoreInfoEntity>) => {
            state.store = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStoreInfo.pending, (state: StoreInfoState) => {
                state.loadingStatus = 'loading';
            })
            .addCase(
                fetchStoreInfo.fulfilled,
                (
                    state: StoreInfoState,
                    action: PayloadAction<{
                        store: StoreInfoEntity | undefined;
                        initialSyncComplete: boolean;
                    }>
                ) => {
                    state.store = action.payload.store;
                    state.loadingStatus = 'loaded';
                    state.initialSyncComplete = action.payload.initialSyncComplete;
                }
            )
            .addCase(
                fetchStoreInfo.rejected,
                (state: StoreInfoState, action) => {
                    state.loadingStatus = 'error';
                    state.initialSyncComplete = false;
                    state.error =
                        typeof action.payload === 'string'
                            ? action.payload
                            : action.error?.message || 'Failed to load store info';
                }
            );
    },
});

/*
 * Export reducer for store configuration.
 */
export const storeInfoReducer = storeInfoSlice.reducer;
export const storeInfoActions = storeInfoSlice.actions;

export const getState = (rootState: RootState): StoreInfoState =>
    rootState[STORE_INFO_FEATURE_KEY];

export const selectStore = createSelector(getState, (state) => state.store);
export const selectLoadindStatus = createSelector(getState, (state) => state.loadingStatus);
export const selectInitialStoreSyncComplete = createSelector(
    getState,
    (state) => state.initialSyncComplete
);
