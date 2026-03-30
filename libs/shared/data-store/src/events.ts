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
                break;
            case 'outboxMutationFailed':
                console.error(
                    `DataStore mutation failed: ${JSON.stringify(data)}`
                );
                break;
            default:
                break;
        }

        if (event === 'networkStatus') {
            logSyncDebug('hub', 'networkStatus', {
                active: (data as { active?: boolean } | undefined)?.active,
            });
        }
    });
