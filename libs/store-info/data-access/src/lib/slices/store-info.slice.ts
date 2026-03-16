import {
    createAsyncThunk,
    createSelector,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import { StoreInfoEntity, StoreInfoEntityMapper } from './store-info.entity';
import DeviceInfo from 'react-native-device-info';
import { StoreInfoService } from './store-info.service';
import { DataStore } from '@pos/shared/amplify';
import { Store } from '@pos/shared/models';
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

const waitForStoreSync = async (ms = 15000): Promise<StoreInfoEntity | undefined> => {
    return new Promise((resolve, reject) => {
        let settled = false;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        let subscription: { unsubscribe: () => void } | undefined;
        const unsubscribe = () => subscription?.unsubscribe();

        subscription = DataStore.observeQuery(Store).subscribe({
            next: ({ isSynced, items }: { isSynced: boolean; items: Store[] }) => {
                if (!isSynced || settled) {
                    return;
                }

                settled = true;
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                unsubscribe();
                resolve(items.length ? StoreInfoEntityMapper.fromModel(items[0]) : undefined);
            },
            error: (error: unknown) => {
                if (settled) {
                    return;
                }

                settled = true;
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                unsubscribe();
                reject(error);
            },
        });

        timeoutId = setTimeout(() => {
            if (settled) {
                return;
            }

            settled = true;
            unsubscribe();
            reject(new Error(`Store sync timed out after ${ms}ms`));
        }, ms);
    });
};

export const fetchStoreInfo = createAsyncThunk(
    'storeInfo/fetchStatus',
    async (_, thunkAPI) => {
        const withTimeout = async <T>(label: string, promise: Promise<T>, ms = 10000) =>
            Promise.race([
                promise,
                new Promise<T>((_, reject) =>
                    setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
                ),
            ]);

        try {
            return {
                store: await waitForStoreSync(),
                initialSyncComplete: true,
            };
        } catch (error) {
            console.warn('Initial store sync did not complete, falling back to local store cache', error);

            try {
                const stores = await withTimeout(
                    'StoreInfoService.getStore() fallback',
                    StoreInfoService.getStore()
                );

                return {
                    store: stores.length ? StoreInfoEntityMapper.fromModel(stores[0]) : undefined,
                    initialSyncComplete: false,
                };
            } catch (fallbackError) {
                return thunkAPI.rejectWithValue(
                    fallbackError instanceof Error
                        ? fallbackError.message
                        : String(fallbackError)
                );
            }
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
                    state.error = action.error?.message || 'Failed to load store info';
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
