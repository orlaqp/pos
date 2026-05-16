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
import { getStore, listStores, updateStore } from '@pos/shared/api';

const isDeletedFlag = (value: unknown) => value === true || value === 'true';
const isRemoteStore = (store: Store | null | undefined): store is Store =>
    !!store && !isDeletedFlag(store._deleted);

const getGraphqlErrorMessage = (result: unknown) => {
    if (!result || typeof result !== 'object' || !('errors' in result)) {
        return undefined;
    }

    const errors =
        (result as { errors?: Array<{ message?: string }> }).errors || [];

    return errors.map((error) => error?.message).filter(Boolean).join(' | ') || undefined;
};

const fetchRemoteStore = async (id: string) => {
    const response = await API.graphql<{
        getStore?: (Store & { _version?: number | null }) | null;
    }>({
        query: getStore,
        variables: { id },
        authMode: 'userPool',
    });

    const message = getGraphqlErrorMessage(response);
    if (message) {
        throw new Error(message);
    }

    const remoteStore = response.data?.getStore;
    return isRemoteStore(remoteStore) ? remoteStore : undefined;
};

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
        const normalizedStore = {
            ...store,
            timezone: store.timezone || 'America/New_York',
        };

        if (!store.id) {
            const model = new Store(
                stampTenant({
                    ...normalizedStore,
                }) as never
            );
            const res = await DataStore.save(model);
            
            store.id = res.id;

            return dispatch(storeInfoActions.set(store));
        }
        
        const existing = await DataStore.query(Store, store.id);

        if (!existing) {
            const remoteStore = await fetchRemoteStore(store.id);

            if (!remoteStore) {
                throw new Error(
                    'Store information is not available yet. Please try again in a moment.'
                );
            }

            const result = await API.graphql({
                query: updateStore,
                variables: {
                    input: {
                        id: remoteStore.id,
                        name: normalizedStore.name,
                        address: normalizedStore.address,
                        city: normalizedStore.city,
                        state: normalizedStore.state,
                        zipCode: normalizedStore.zipCode,
                        country: normalizedStore.country,
                        email: normalizedStore.email,
                        fax: normalizedStore.fax,
                        disclaimer: normalizedStore.disclaimer,
                        phone: normalizedStore.phone,
                        timezone:
                            normalizedStore.timezone ||
                            remoteStore.timezone ||
                            'America/New_York',
                        _version: remoteStore._version,
                    },
                },
                authMode: 'userPool',
            });

            const message = getGraphqlErrorMessage(result);
            if (message) {
                throw new Error(message);
            }

            return dispatch(
                storeInfoActions.set({
                    ...normalizedStore,
                    id: remoteStore.id,
                })
            );
        }

        await DataStore.save(
            Store.copyOf(existing, updated => {
                updated.name = normalizedStore.name;
                updated.address = normalizedStore.address;
                updated.city = normalizedStore.city;
                updated.state = normalizedStore.state;
                updated.zipCode = normalizedStore.zipCode;
                updated.country = normalizedStore.country;
                updated.email = normalizedStore.email;
                updated.fax = normalizedStore.fax;
                updated.disclaimer = normalizedStore.disclaimer;
                updated.phone = normalizedStore.phone;
                updated.timezone =
                    normalizedStore.timezone ||
                    existing.timezone ||
                    'America/New_York';
            })
        );
        
        return dispatch(storeInfoActions.set(normalizedStore));
    }

}
