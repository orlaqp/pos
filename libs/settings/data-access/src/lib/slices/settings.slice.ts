/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { RootState } from '@pos/store';
import {
    createAsyncThunk,
    createSelector,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';

import { productsSubscription, productsActions } from '@pos/products/data-access';
import { AvailableLanguage, setI18nConfig } from '../language/language.utils';

export const SETTINGS_FEATURE_KEY = 'settings';

export interface SettingsState {
    darkTheme: boolean;
    dataStoreStatus: 'not synced' | 'resetting' | 'error' | 'synced';
    languageTag: AvailableLanguage;
}

export const initialSettingsState: SettingsState = {
    darkTheme: false,
    dataStoreStatus: 'not synced',
    languageTag: 'en',
};

export const resetDataStore = createAsyncThunk(
    'settings/reset',
    async (_, thunkApi) => {
        thunkApi.dispatch(productsActions.reset());

        productsSubscription?.unsubscribe();
        
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
        setLanguage: (state: SettingsState, action: PayloadAction<AvailableLanguage>) => {
            state.languageTag = action.payload;
            setI18nConfig(action.payload);
        }
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
