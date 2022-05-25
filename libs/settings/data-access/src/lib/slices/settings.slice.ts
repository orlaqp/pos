import { orderLinesSubscription } from './../../../../../orders/data-access/src/lib/order.service';
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { RootState } from '@pos/store';
import {
    createAsyncThunk,
    createSelector,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';

import { productsSubscription } from '@pos/products/data-access';
import { categoriesSubscription } from '@pos/categories/data-access';
import { brandsSubscription } from '@pos/brands/data-access';
import { ordersSubscription } from '@pos/orders/data-access';

export const SETTINGS_FEATURE_KEY = 'settings';

export interface SettingsState {
    darkTheme: boolean;
    dataStoreStatus: 'not synced' | 'resetting' | 'error' | 'synced';
}

export const initialSettingsState: SettingsState = {
    darkTheme: false,
    dataStoreStatus: 'not synced',
};

export const resetDataStore = createAsyncThunk(
    'settings/reset',
    async (_, thunkApi) => {
        productsSubscription?.unsubscribe();
        categoriesSubscription?.unsubscribe();
        brandsSubscription?.unsubscribe();
        ordersSubscription?.unsubscribe();
        orderLinesSubscription?.unsubscribe();

        await DataStore.stop();
        await DataStore.clear();
        await DataStore.start();
    }
);

export const settingsSlice = createSlice({
    name: SETTINGS_FEATURE_KEY,
    initialState: initialSettingsState,
    reducers: {
        set: (state: SettingsState, action: PayloadAction<boolean>) => {
            state.darkTheme = action.payload;
        },
    },
    extraReducers: (builder) => builder
        .addCase(resetDataStore.pending, (state: SettingsState) => {
            state.dataStoreStatus = 'resetting';
        })
        .addCase(resetDataStore.fulfilled, (state: SettingsState) => {
            state.dataStoreStatus = 'synced';
        })
        .addCase(resetDataStore.rejected, (state: SettingsState) => {
            state.dataStoreStatus = 'error';
        }),
});

export const settingsReducer = settingsSlice.reducer;
export const settingsActions = settingsSlice.actions;

export const getSettingsState = (rootState: RootState): SettingsState =>
    rootState[SETTINGS_FEATURE_KEY];

export const selectSettings = createSelector(
    getSettingsState,
    (state) => state
);
