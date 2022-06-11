import { Dispatch } from '@reduxjs/toolkit';
import { Hub } from 'aws-amplify';
import { ModelSyncedEvent } from './definitions';
import { syncModelsWithStore } from './sync';

// Create listener
export const subscribeEvents = (dispatch: Dispatch) => Hub.listen('datastore', async hubData => {
    const  { event, data } = hubData.payload;
    console.log(`${event} - data: ${JSON.stringify(data)}`);

    switch (event) {
        // case 'ready':
        //     syncModelsWithStore(dispatch, (data as ModelSyncedEvent).model.name);
        //     break;
        case 'modelSynced':
            syncModelsWithStore(dispatch, (data as ModelSyncedEvent).model.name);
            break;
        // case 'outboxMutationProcessed':
            
        default:
            break;
    }

    if (event === 'networkStatus') {
      console.log(`User has a network connection: ${data.active}`)
    }
  })
  
