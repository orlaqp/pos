import { Dispatch } from '@reduxjs/toolkit';
import { Hub } from 'aws-amplify';
import { ModelSyncedEvent } from './definitions';
import { eventsActions } from './lib/events.slice';
import { syncModelsWithStore } from './sync';
import uuid from 'react-native-uuid';

// Create listener
export const subscribeEvents = (dispatch: Dispatch) =>
    Hub.listen('datastore', async (hubData) => {
        const { event, data } = hubData.payload;
        console.log(`${event} - data: ${JSON.stringify(data)}`);

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
                syncModelsWithStore(
                    dispatch,
                    (data as ModelSyncedEvent).model.name
                );
                break;
            default:
                break;
        }

        if (event === 'networkStatus') {
            console.log(`User has a network connection: ${data.active}`);
        }
    });
