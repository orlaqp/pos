import { GlobalSettingsEntityMapper } from './global-settings.dto';
import { DataStore } from '@pos/shared/amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { GlobalSettings } from '@pos/shared/models';
import { settingsActions } from './slices/settings.slice';

const globalSettingsDispatchRefs = new Map<Dispatch, number>();

let sharedGlobalSettingsSubscription:
    | {
          unsubscribe: () => void;
      }
    | undefined;

let globalSettingsSnapshot: GlobalSettings[] | undefined;

export const syncGlobalSettings = (dispatch: Dispatch) => {
    let subscription: { unsubscribe: () => void } | undefined = undefined;
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
    const currentCount = globalSettingsDispatchRefs.get(dispatch) || 0;
    globalSettingsDispatchRefs.set(dispatch, currentCount + 1);

    if (!sharedGlobalSettingsSubscription) {
        const subscription = DataStore.observeQuery(GlobalSettings).subscribe(
            ({ isSynced, items }) => {
                void isSynced;
                globalSettingsSnapshot = items;
                globalSettingsDispatchRefs.forEach((_, activeDispatch) => {
                    updateStore(activeDispatch, items);
                });
            }
        );

        sharedGlobalSettingsSubscription = {
            unsubscribe() {
                subscription.unsubscribe();
                globalSettingsSnapshot = undefined;
                sharedGlobalSettingsSubscription = undefined;
            },
        };
    } else if (globalSettingsSnapshot) {
        updateStore(dispatch, globalSettingsSnapshot);
    }

    return {
        unsubscribe() {
            const nextCount = (globalSettingsDispatchRefs.get(dispatch) || 1) - 1;

            if (nextCount <= 0) {
                globalSettingsDispatchRefs.delete(dispatch);
            } else {
                globalSettingsDispatchRefs.set(dispatch, nextCount);
            }

            if (globalSettingsDispatchRefs.size === 0) {
                sharedGlobalSettingsSubscription?.unsubscribe();
            }
        },
    };
};

const updateStore = (dispatch: Dispatch, items: GlobalSettings[]) => {
    dispatch(settingsActions.setGlobalSettings(GlobalSettingsEntityMapper.from(items[0])));
};
