import { GlobalSettingsEntityMapper } from './global-settings.dto';
import { DataStore } from '@pos/shared/amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { GlobalSettings } from '@pos/shared/models';
import { settingsActions } from './slices/settings.slice';

export const syncGlobalSettings = (dispatch: Dispatch) => {
    let subscription: { unsubscribe: () => void } | undefined;
    let shouldUnsubscribeAfterSubscribe = false;
    subscription = DataStore.observeQuery(GlobalSettings).subscribe(({ items }) => {
        updateStore(dispatch, items);
        if (subscription) {
            subscription.unsubscribe();
            return;
        }

        shouldUnsubscribeAfterSubscribe = true;
    });

    if (shouldUnsubscribeAfterSubscribe) {
        subscription.unsubscribe();
    }
};

export const subscribeToGlobalSettingsChanges = (dispatch: Dispatch) => {
    return DataStore.observeQuery(GlobalSettings).subscribe(({ isSynced, items }) => {
        void isSynced;
        updateStore(dispatch, items);
    });
};

const updateStore = (dispatch: Dispatch, items: GlobalSettings[]) => {
    dispatch(settingsActions.setGlobalSettings(GlobalSettingsEntityMapper.from(items[0])));
};
