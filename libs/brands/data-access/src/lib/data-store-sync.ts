import { DataStore } from 'aws-amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { Brand } from '@pos/shared/models';
import { brandsActions } from './slices/brands.slice';
import { BrandEntityMapper } from './brand.entity';

export const syncBrands = (dispatch: Dispatch) => {
    console.log('Syncing brands to the store');
    DataStore.query(Brand).then((brands) =>
        dispatch(
            brandsActions.setAll(
                brands.map((b) => BrandEntityMapper.fromModel(b))
            )
        )
    );
};

export const subscribeToBrandChanges = (dispatch: Dispatch) => {
    return DataStore.observeQuery(Brand).subscribe(({ isSynced, items }) => {
        console.log('Brand changes detected');

        if (isSynced) {
            items.sort((a, b) => {
                if (a.name > b.name) return 1;
                if (a.name < b.name) return -1;

                return 0;
            });
            dispatch(
                brandsActions.setAll(
                    items.map((b) => BrandEntityMapper.fromModel(b))
                )
            );
        }
    });
};
