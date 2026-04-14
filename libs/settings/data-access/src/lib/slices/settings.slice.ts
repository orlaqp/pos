import { GlobalSettingsDTO } from './../global-settings.dto';
/* eslint-disable @nx/enforce-module-boundaries */
import { RootState } from '@pos/store';
import {
    createAsyncThunk,
    createSelector,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import { DataStore } from '@pos/shared/amplify';

import { teardownProductSync, productsActions } from '@pos/products/data-access';
import { AvailableLanguage, setI18nConfig } from '../language/language.utils';
import { DeviceSettingsService } from '../services/device-settings.service';
import { GlobalSettingsService } from '../services/global-settings.service';

export const SETTINGS_FEATURE_KEY = 'settings';

export interface SettingsState {
    darkTheme: boolean;
    dataStoreStatus: 'not synced' | 'resetting' | 'error' | 'synced';
    deviceSettingsStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
    globalSettingsStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
    languageTag: AvailableLanguage;
    payFromSalesScreen: boolean;
    globalSettings: GlobalSettingsDTO | null;
}

export const initialSettingsState: SettingsState = {
    darkTheme: false,
    dataStoreStatus: 'not synced',
    deviceSettingsStatus: 'not loaded',
    globalSettingsStatus: 'not loaded',
    languageTag: 'en',
    payFromSalesScreen: false,
    globalSettings: null,
};

export const resetDataStore = createAsyncThunk(
    'settings/reset',
    async (_, thunkApi) => {
        thunkApi.dispatch(productsActions.reset());
        teardownProductSync();
        
        await DataStore.stop();
        await DataStore.clear();
        await DataStore.start();
    }
);

export const fetchGlobalSettings = createAsyncThunk(
    'globalSettings/fetch',
    async (_, thunkAPI) => {
        return await GlobalSettingsService.fetch();
    }
);

export const fetchDeviceSettings = createAsyncThunk(
    'settings/device/fetch',
    async () => DeviceSettingsService.getSettings()
);

export const updatePayFromSalesScreen = createAsyncThunk(
    'settings/device/updatePayFromSalesScreen',
    async (enabled: boolean, thunkApi) => {
        const nextSettings = await DeviceSettingsService.saveSettings({
            payFromSalesScreen: enabled,
        });
        thunkApi.dispatch(settingsActions.setPayFromSalesScreen(nextSettings.payFromSalesScreen));
        return nextSettings;
    }
);

export const updateGlobalSettings = createAsyncThunk(
    'gllbalSettings/update',
    async (settings: GlobalSettingsDTO, thunkApi) => {
        await GlobalSettingsService.updateSettings(settings);
        thunkApi.dispatch(settingsActions.setGlobalSettings(settings));
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
        },
        setPayFromSalesScreen: (state: SettingsState, action: PayloadAction<boolean>) => {
            state.payFromSalesScreen = action.payload;
        },
        setGlobalSettings: (state: SettingsState, action: PayloadAction<GlobalSettingsDTO | null>) => {
            state.globalSettings = action.payload;
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
        })
        .addCase(fetchDeviceSettings.pending, (state: SettingsState) => {
            state.deviceSettingsStatus = 'loading';
        })
        .addCase(fetchDeviceSettings.fulfilled, (state: SettingsState, action) => {
            state.payFromSalesScreen = action.payload.payFromSalesScreen;
            state.deviceSettingsStatus = 'loaded';
        })
        .addCase(fetchDeviceSettings.rejected, (state: SettingsState) => {
            state.deviceSettingsStatus = 'error';
        })
        .addCase(fetchGlobalSettings.pending, (state: SettingsState) => {
            state.globalSettingsStatus = 'loading';
        })
        .addCase(fetchGlobalSettings.fulfilled, (state: SettingsState, action: PayloadAction<GlobalSettingsDTO | null>) => {
            state.globalSettings = action.payload;
            state.globalSettingsStatus = 'loaded';
        })
        .addCase(fetchGlobalSettings.rejected, (state: SettingsState) => {
            state.globalSettingsStatus = 'error';
        })
});

export const settingsReducer = settingsSlice.reducer;
export const settingsActions = settingsSlice.actions;

export const getSettingsState = (rootState: RootState): SettingsState =>
    rootState[SETTINGS_FEATURE_KEY];

    
export const selectSettings = getSettingsState;
        
export const getGlobalSettings = createSelector(
    getSettingsState,
    (state) => state.globalSettings
);

export const getGlobalSettingsLoadingStatus = createSelector(
    getSettingsState,
    (state) => state.globalSettingsStatus
);

export const selectPayFromSalesScreen = createSelector(
    getSettingsState,
    (state) => state.payFromSalesScreen
);
