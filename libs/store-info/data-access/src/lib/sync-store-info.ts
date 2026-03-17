import { Store } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from '@pos/shared/amplify';
import { selectPreferredStore, StoreInfoEntityMapper } from './slices/store-info.entity';
import { storeInfoActions } from './slices/store-info.slice';

export const syncStoreInfo = (dispatch: Dispatch) => {
    console.log('Syncing store info to the store');
    DataStore.query(Store).then((items) => {
        const preferredStore = selectPreferredStore(items);
        if (!preferredStore) return;

        dispatch(
            storeInfoActions.set(StoreInfoEntityMapper.fromModel(preferredStore))
        );
    });
};
