import { Store } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { StoreInfoEntityMapper } from './slices/store-info.entity';
import { storeInfoActions } from './slices/store-info.slice';

export const syncStoreInfo = (dispatch: Dispatch) => {
    console.log('Syncing store info to the store');
    DataStore.query(Store).then((items) => {
        if (items.length === 0) return;

        dispatch(
            storeInfoActions.set(StoreInfoEntityMapper.fromModel(items[0]))
        );
    });
};
