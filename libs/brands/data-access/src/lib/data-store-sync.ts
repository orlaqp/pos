import { DataStore } from 'aws-amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { Brand } from '@pos/shared/models';
import { brandsActions } from './slices/brands.slice';
import { BrandEntityMapper } from './brand.entity';
import { sortListBy } from '@pos/shared/utils';

export const syncBrands = (dispatch: Dispatch) => {
    console.log('Syncing brands to the store');
    DataStore.query(Brand).then((brands) => updateStore(dispatch, brands));
};

export const subscribeToBrandChanges = (dispatch: Dispatch) => {
    return DataStore.observeQuery(Brand).subscribe(({ isSynced, items }) => {
        if (isSynced) {
            console.log('Brand changes detected');
            updateStore(dispatch, items);
        }
    });
};

const updateStore = (dispatch: Dispatch, items: Brand[]) => {
    sortListBy(items, 'name');
    dispatch(
        brandsActions.setAll(items.map((b) => BrandEntityMapper.fromModel(b)))
    );
};
