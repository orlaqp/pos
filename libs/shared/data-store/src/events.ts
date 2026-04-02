import { Dispatch } from '@reduxjs/toolkit';
import { Hub } from '@pos/shared/amplify';
import { ModelSyncedEvent } from './definitions';
import { eventsActions } from './lib/events.slice';
import uuid from 'react-native-uuid';
import { logSyncDebug } from '@pos/shared/utils';

// Create listener
export const subscribeEvents = (dispatch: Dispatch) =>
    Hub.listen('datastore', async (hubData) => {
        const { event, data } = hubData.payload;
        logSyncDebug('hub', event, {
            source: hubData.source,
            data,
        });

        dispatch(
            eventsActions.add({
                id: uuid.v4().toString(),
                event: event,
                data: JSON.stringify(data),
                timestamp: (new Date()).toISOString()
            })
        );

        switch (event) {
            // case 'ready':
            //     syncModelsWithStore(dispatch, (data as ModelSyncedEvent).model.name);
            //     break;
            case 'modelSynced':
                logSyncDebug('hub', 'modelSynced:dispatch', {
                    model: (data as ModelSyncedEvent).model.name,
                    isFullSync: (data as ModelSyncedEvent & { isFullSync?: boolean }).isFullSync,
                    isDeltaSync: (data as ModelSyncedEvent & { isDeltaSync?: boolean }).isDeltaSync,
                    counts: (data as ModelSyncedEvent & { counts?: unknown }).counts,
                });
                if ((data as ModelSyncedEvent).model.name === 'Product') {
                    logSyncDebug('hub', 'product:modelSynced', {
                        isFullSync: (data as ModelSyncedEvent & { isFullSync?: boolean }).isFullSync,
                        isDeltaSync: (data as ModelSyncedEvent & { isDeltaSync?: boolean }).isDeltaSync,
                        counts: (data as ModelSyncedEvent & { counts?: unknown }).counts,
                    });
                }
                break;
            case 'subscriptionError':
                console.error(
                    `DataStore subscriptionError: ${JSON.stringify(data)}`
                );
                break;
            case 'outboxMutationFailed':
                dispatch(
                    eventsActions.recordOutboxMutationFailed(
                        new Date().toISOString()
                    )
                );
                console.error(
                    `DataStore mutation failed: ${JSON.stringify(data)}`
                );
                break;
            case 'outboxStatus':
                dispatch(
                    eventsActions.setOutboxStatus(
                        !!(data as { isEmpty?: boolean } | undefined)?.isEmpty
                    )
                );
                break;
            default:
                break;
        }

        if (event === 'networkStatus') {
            dispatch(
                eventsActions.setNetworkStatus(
                    !!(data as { active?: boolean } | undefined)?.active
                )
            );
            logSyncDebug('hub', 'networkStatus', {
                active: (data as { active?: boolean } | undefined)?.active,
            });
        }
    });
