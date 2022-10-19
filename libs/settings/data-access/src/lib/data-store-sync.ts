import { GlobalSettingsEntityMapper } from './global-settings.dto';
import { DataStore } from 'aws-amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { GlobalSettings } from '@pos/shared/models';
import { settingsActions } from './slices/settings.slice';

export const syncGlobalSettings = (dispatch: Dispatch) => {
    console.log('Syncing global settings to the store');
    DataStore.query(GlobalSettings).then((settings) =>
        updateStore(dispatch, settings)
    );
};

export const subscribeToGlobalSettingsChanges = (dispatch: Dispatch) => {
    return DataStore.observeQuery(GlobalSettings).subscribe(({ isSynced, items }) => {
        if (!isSynced) return;
        console.log('Global Settings changes detected');
        updateStore(dispatch, items);
    });
};

const updateStore = (dispatch: Dispatch, items: GlobalSettings[]) => {
    dispatch(settingsActions.setGlobalSettings(GlobalSettingsEntityMapper.from(items[0])));
};
