import { DataStore } from '@pos/shared/amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { Brand } from '@pos/shared/models';
import { brandsActions } from './slices/brands.slice';
import { BrandEntityMapper } from './brand.entity';
import { sortListBy } from '@pos/shared/utils';

export const syncBrands = (dispatch: Dispatch) => {
    let subscription: { unsubscribe: () => void } | undefined;
    let shouldUnsubscribeAfterSubscribe = false;
    subscription = DataStore.observeQuery(Brand).subscribe(({ items }) => {
        updateStore(dispatch, items);
        if (subscription) {
            subscription.unsubscribe();
            return;
        }

        shouldUnsubscribeAfterSubscribe = true;
    });

    if (shouldUnsubscribeAfterSubscribe) {
        subscription.unsubscribe();
    }
};

export const subscribeToBrandChanges = (dispatch: Dispatch) => {
    return DataStore.observeQuery(Brand).subscribe(({ isSynced, items }) => {
        void isSynced;
        updateStore(dispatch, items);
    });
};

const updateStore = (dispatch: Dispatch, items: Brand[]) => {
    sortListBy(items, 'name');
    dispatch(
        brandsActions.setAll(items.map((b) => BrandEntityMapper.fromModel(b)))
    );
};
