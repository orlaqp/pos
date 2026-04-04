import { Dispatch } from '@reduxjs/toolkit';
import { Hub } from '@pos/shared/amplify';
import { ModelSyncedEvent } from './definitions';
import { eventsActions } from './lib/events.slice';
import { logSyncDebug } from '@pos/shared/utils';

const RECORDED_EVENTS = new Set([
    'modelSynced',
    'subscriptionError',
    'outboxMutationFailed',
    'outboxStatus',
    'networkStatus',
]);

let eventSequence = 0;

const summarizeDataStoreEvent = (event: string, data: unknown): string => {
    switch (event) {
        case 'modelSynced': {
            const modelSynced = data as
                | (ModelSyncedEvent & {
                      counts?: {
                          new?: number;
                          updated?: number;
                          deleted?: number;
                      };
                  })
                | undefined;
            const counts = modelSynced?.counts;
            return [
                `model=${modelSynced?.model?.name ?? 'unknown'}`,
                `full=${modelSynced?.isFullSync ? 'yes' : 'no'}`,
                `delta=${modelSynced?.isDeltaSync ? 'yes' : 'no'}`,
                `new=${counts?.new ?? 0}`,
                `updated=${counts?.updated ?? 0}`,
                `deleted=${counts?.deleted ?? 0}`,
            ].join(' ');
        }
        case 'subscriptionError': {
            const errorData = data as
                | { message?: string; error?: string; recoverySuggestion?: string }
                | undefined;
            return (
                errorData?.message ??
                errorData?.error ??
                errorData?.recoverySuggestion ??
                'subscription error'
            );
        }
        case 'outboxMutationFailed': {
            const mutationData = data as
                | {
                      model?: { name?: string };
                      operation?: string;
                      element?: { id?: string };
                  }
                | undefined;
            return [
                `model=${mutationData?.model?.name ?? 'unknown'}`,
                `operation=${mutationData?.operation ?? 'unknown'}`,
                `id=${mutationData?.element?.id ?? 'unknown'}`,
            ].join(' ');
        }
        case 'outboxStatus':
            return `empty=${
                (data as { isEmpty?: boolean } | undefined)?.isEmpty ? 'yes' : 'no'
            }`;
        case 'networkStatus':
            return `active=${
                (data as { active?: boolean } | undefined)?.active ? 'yes' : 'no'
            }`;
        default:
            return '';
    }
};

// Create listener
export const subscribeEvents = (dispatch: Dispatch) =>
    Hub.listen('datastore', async (hubData) => {
        const { event, data } = hubData.payload;
        const timestamp = new Date().toISOString();
        logSyncDebug('hub', event, {
            source: hubData.source,
            data,
        });

        if (RECORDED_EVENTS.has(event)) {
            eventSequence += 1;
            dispatch(
                eventsActions.add({
                    id: `${event}-${timestamp}-${eventSequence}`,
                    event,
                    data: summarizeDataStoreEvent(event, data),
                    timestamp,
                })
            );
        }

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
                    `DataStore subscriptionError: ${summarizeDataStoreEvent(
                        event,
                        data
                    )}`
                );
                break;
            case 'outboxMutationFailed':
                dispatch(
                    eventsActions.recordOutboxMutationFailed(timestamp)
                );
                console.error(
                    `DataStore mutation failed: ${summarizeDataStoreEvent(
                        event,
                        data
                    )}`
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
