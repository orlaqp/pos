import { storeInfoActions } from './store-info.slice';
import {
    isStoreInfoIncomplete,
    selectPreferredStore,
    StoreInfoEntity,
} from './store-info.entity';
import { Store } from '@pos/shared/models'
import { Dispatch } from '@reduxjs/toolkit';
import { API, DataStore } from '@pos/shared/amplify'
import { stampTenant } from '@pos/auth/data-access';
import { listStores } from '@pos/shared/api';

const isDeletedFlag = (value: unknown) => value === true || value === 'true';
const isRemoteStore = (store: Store | null | undefined): store is Store =>
    !!store && !isDeletedFlag(store._deleted);

export class StoreInfoService {
    static async getStore() {
        const localStores = await DataStore.query(Store);
        const preferredLocalStore = selectPreferredStore(localStores);

        if (localStores.length > 0 && preferredLocalStore && !isStoreInfoIncomplete(preferredLocalStore)) {
            return localStores;
        }

        const response = await API.graphql<{
            listStores?: {
                items?: Array<Store | null> | null;
            } | null;
        }>({
            query: listStores,
            variables: {
                limit: 100,
            },
            authMode: 'userPool',
        });

        const remoteStores = response.data?.listStores?.items?.filter(isRemoteStore) ?? [];

        if (remoteStores.length === 0) {
            return localStores;
        }

        const localIds = new Set(localStores.map((store) => store.id));
        return [
            ...localStores,
            ...remoteStores.filter((store) => !localIds.has(store.id)),
        ];
    }

    static async save(dispatch: Dispatch<any>, store: StoreInfoEntity) {
        if (!store.id) {
            const model = new Store(
                stampTenant({
                    ...store,
                    timezone: store.timezone || 'America/New_York',
                }) as never
            );
            const res = await DataStore.save(model);
            
            store.id = res.id;

            return dispatch(storeInfoActions.set(store));
        }
        
        const existing = await DataStore.query(Store, store.id);

        if (!existing) {
            throw new Error(
                'Store information is not available locally yet. Please try again in a moment.'
            );
        }

        await DataStore.save(
            Store.copyOf(existing, updated => {
                updated.name = store.name;
                updated.address = store.address;
                updated.city = store.city;
                updated.state = store.state;
                updated.zipCode = store.zipCode;
                updated.country = store.country;
                updated.email = store.email;
                updated.fax = store.fax;
                updated.disclaimer = store.disclaimer;
                updated.phone = store.phone;
                updated.timezone = store.timezone || existing.timezone || 'America/New_York';
            })
        );
        
        return dispatch(storeInfoActions.set(store));
    }

}
