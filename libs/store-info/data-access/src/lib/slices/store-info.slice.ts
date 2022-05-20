import {
    createAsyncThunk,
    createSelector,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import { StoreInfoEntity, StoreInfoEntityMapper } from './store-info.entity';
import DeviceInfo from 'react-native-device-info';
import { StoreInfoService } from './store-info.service';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { RootState } from '@pos/store';

export const STORE_INFO_FEATURE_KEY = 'storeInfo';
const deviceId = DeviceInfo.getUniqueId();

export interface StoreInfoState {
    deviceId: string;
    loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
    store?: StoreInfoEntity;
    error?: string;
}

export const fetchStoreInfo = createAsyncThunk(
    'storeInfo/fetchStatus',
    async (_, thunkAPI) => {
        const store = await StoreInfoService.getStore();
        if (!store.length) return undefined;

        return StoreInfoEntityMapper.fromModel(store[0]);
    }
);

export const initialStoreInfoState: StoreInfoState = {
    deviceId,
    loadingStatus: 'not loaded',
    error: undefined,
    store: undefined,
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
                    action: PayloadAction<StoreInfoEntity | undefined>
                ) => {
                    state.store = action.payload;
                    state.loadingStatus = 'loaded';
                }
            )
            .addCase(
                fetchStoreInfo.rejected,
                (state: StoreInfoState, action) => {
                    state.loadingStatus = 'error';
                    state.error = action.error.message;
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

