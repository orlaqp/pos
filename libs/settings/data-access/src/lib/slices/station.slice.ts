import {
    createAsyncThunk,
    createSelector,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { RootState } from '@pos/store';
import { StationConfig, StationService } from '../services/station.service';

export const STATION_FEATURE_KEY = 'station';

export interface StationState extends StationConfig {
    loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
    error?: string;
}

export const fetchStationInfo = createAsyncThunk(
    'station/fetchStatus',
    async (_, thunkAPI) => {
        const store = await StationService.getConfig();
        
        return { ...store }
    }
);

export const saveStationNumber = createAsyncThunk(
    'station/saveStationNumber',
    async (stationNumber: string, thunkAPI) => {
        await StationService.saveStationNo(stationNumber);
        return stationNumber;
    }
);

export const initialStationState: StationState = {
    loadingStatus: 'not loaded',
    error: undefined,
    stationNumber: undefined,
    currentDate: undefined,
    orderNumber: undefined,
};

export const stationSlice = createSlice({
    name: STATION_FEATURE_KEY,
    initialState: initialStationState,
    reducers: {
        set: (state: StationState, action: PayloadAction<StationConfig>) => {
            state.stationNumber = action.payload.stationNumber;
            state.orderNumber = action.payload.orderNumber;
            state.currentDate = action.payload.currentDate;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStationInfo.pending, (state: StationState) => {
                state.loadingStatus = 'loading';
            })
            .addCase(
                fetchStationInfo.fulfilled,
                (
                    state: StationState,
                    action: PayloadAction<StationConfig>
                ) => {
                    state.stationNumber = action.payload.stationNumber;
                    state.orderNumber = action.payload.orderNumber;
                    state.currentDate = action.payload.currentDate;
                    state.loadingStatus = 'loaded';
                }
            )
            .addCase(
                fetchStationInfo.rejected,
                (state: StationState, action) => {
                    state.loadingStatus = 'error';
                    state.error = action.error.message;
                }
            )
            .addCase(saveStationNumber.fulfilled, (state: StationState, action) => {
                state.stationNumber = action.payload;
            });
    },
});

/*
 * Export reducer for store configuration.
 */
export const stationReducer = stationSlice.reducer;
export const stationActions = stationSlice.actions;

export const getState = (rootState: RootState): StationState =>
    rootState[STATION_FEATURE_KEY];

export const selectStation = createSelector(getState, (state) => state);
export const selectStationLoadindStatus = createSelector(getState, (state) => state.loadingStatus);

