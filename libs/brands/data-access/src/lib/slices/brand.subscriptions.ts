import { BrandEntityMapper, brandsActions } from '@pos/brands/data-access';
import { Brand } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
export const observeBrandChanges = (dispatch: Dispatch) => {
    DataStore.observeQuery(Brand).subscribe(({ isSynced, items }) => {
        if (isSynced) {
            items.sort((a, b) => {
                if (a.name > b.name) return 1;
                if (a.name < b.name) return -1;

                return 0;
            })
            dispatch(brandsActions.setAll(
                items
                    .map(i => BrandEntityMapper.fromModel(i))
            ));
        }
    });
}