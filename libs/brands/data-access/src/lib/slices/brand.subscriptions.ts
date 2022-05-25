import { Brand } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { ZenObservable } from 'zen-observable-ts';
import { BrandEntityMapper } from '../brand.entity';
import { brandsActions } from './brands.slice';

export let brandsSubscription: ZenObservable.Subscription | null;

export const observeBrandChanges = (dispatch: Dispatch) => {
    if (brandsSubscription) {
        brandsSubscription.unsubscribe();
        brandsSubscription = null;
    }

    brandsSubscription = DataStore.observeQuery(Brand).subscribe(({ isSynced, items }) => {
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