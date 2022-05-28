import { DataStore } from 'aws-amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { Brand } from '@pos/shared/models';
import { brandsActions } from './slices/brands.slice';
import { BrandEntityMapper } from './brand.entity';

export const syncBrands = (dispatch: Dispatch) => {
    console.log('Syncing brands to the store');
    DataStore.query(Brand).then((brands) =>
        dispatch(brandsActions.setAll(
            brands.map((b) => BrandEntityMapper.fromModel(b))
        ))
    );
};
