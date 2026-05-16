import { Dispatch } from '@reduxjs/toolkit';
import { subscribeEvents } from './events';

export * from './lib/events.slice';
export * from './lib/observe-query-manager';

export const initializeDataStore = (dispatch: Dispatch) => {
    subscribeEvents(dispatch);
};

export {
    configureDataStore,
    enableInventorySync,
    isInventorySyncEnabled,
    resetInventorySyncForTests,
} from './config';
