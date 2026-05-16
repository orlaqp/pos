import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from '@pos/shared/amplify';
import { createSharedObserveQueryManager } from '@pos/shared/data-store';
import { GlobalSettings } from '@pos/shared/models';
import { logSyncDebug, startSyncMeasure } from '@pos/shared/utils';
import { GlobalSettingsEntityMapper } from './global-settings.dto';
import { settingsActions } from './slices/settings.slice';

const GLOBAL_SETTINGS_SYNC_MODEL = 'globalSettings';

const isNotDeleted = (item: { _deleted?: boolean | null } | null | undefined) =>
    !!item && item._deleted !== true;

const updateStore = (dispatch: Dispatch, items: GlobalSettings[]) => {
    logSyncDebug('globalSettings', 'updateStore', {
        itemCount: items.length,
    });
    dispatch(
        settingsActions.setGlobalSettings(
            GlobalSettingsEntityMapper.from(items[0])
        )
    );
};

const globalSettingsSyncManager = createSharedObserveQueryManager<
    GlobalSettings,
    GlobalSettings[]
>({
    model: GLOBAL_SETTINGS_SYNC_MODEL,
    trackKey: 'globalSettings.observeQuery',
    observeQuery: () => DataStore.observeQuery(GlobalSettings),
    mapSnapshot: ({ isSynced, items }) => {
        const activeItems = items.filter((item) =>
            isNotDeleted(item as { _deleted?: boolean | null })
        );

        logSyncDebug('globalSettings.observeQuery', 'update', {
            isSynced,
            itemCount: activeItems.length,
        });

        return activeItems;
    },
    publishSnapshot: (dispatch, items) => {
        updateStore(dispatch, items);
    },
});

export const syncGlobalSettings = async (dispatch: Dispatch) => {
    const finish = startSyncMeasure('globalSettings', 'syncGlobalSettings');
    const items = (await DataStore.query(GlobalSettings)).filter((item) =>
        isNotDeleted(item as { _deleted?: boolean | null })
    );
    finish({ itemCount: items.length });
    updateStore(dispatch, items);
};

export const ensureGlobalSettingsSyncHealthy = async (
    dispatch: Dispatch,
    options?: {
        staleAfterMs?: number;
        tenantId?: string;
    }
) => globalSettingsSyncManager.ensureHealthy(dispatch, options);

export const subscribeToGlobalSettingsChanges = (
    dispatch: Dispatch,
    tenantId?: string
) => globalSettingsSyncManager.subscribe(dispatch, tenantId);
