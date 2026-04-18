import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from '@pos/shared/amplify';
import { createSharedObserveQueryManager } from '@pos/shared/data-store';
import { Brand } from '@pos/shared/models';
import { sortListBy } from '@pos/shared/utils';
import { BrandEntityMapper } from './brand.entity';
import { brandsActions } from './slices/brands.slice';

const BRAND_SYNC_MODEL = 'brands';

const updateStore = (dispatch: Dispatch, items: Brand[]) => {
    sortListBy(items, 'name');
    dispatch(
        brandsActions.setAll(items.map((brand) => BrandEntityMapper.fromModel(brand)))
    );
};

const brandSyncManager = createSharedObserveQueryManager<Brand, Brand[]>({
    model: BRAND_SYNC_MODEL,
    trackKey: 'brands.observeQuery',
    observeQuery: () => DataStore.observeQuery(Brand),
    mapSnapshot: ({ items }) => items,
    publishSnapshot: (dispatch, items) => {
        updateStore(dispatch, items);
    },
});

export const syncBrands = async (dispatch: Dispatch) => {
    updateStore(dispatch, await DataStore.query(Brand));
};

export const ensureBrandSyncHealthy = async (
    dispatch: Dispatch,
    options?: {
        staleAfterMs?: number;
        tenantId?: string;
    }
) => brandSyncManager.ensureHealthy(dispatch, options);

export const subscribeToBrandChanges = (
    dispatch: Dispatch,
    tenantId?: string
) => brandSyncManager.subscribe(dispatch, tenantId);
