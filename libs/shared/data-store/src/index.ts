import { Dispatch } from '@reduxjs/toolkit';
import { configureDataStore } from './config';
import { subscribeEvents } from './events';

export * from './lib/events.slice';

export const initializeDataStore = (dispatch: Dispatch) => {
    console.log('Initializing data store');
    console.log('Subscribing to data store events');
    subscribeEvents(dispatch);
    configureDataStore();
};
