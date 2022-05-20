import { storeInfoActions } from './store-info.slice';
import { StoreInfoEntity } from './store-info.entity';
import { Store } from '@pos/shared/models'
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify'

export class StoreInfoService {
    static getStore() {
        return DataStore.query(Store);
    }

    static async save(dispatch: Dispatch<any>, store: StoreInfoEntity) {
        if (!store.id) {
            const model = new Store(store);
            const res = await DataStore.save(model);
            
            store.id = res.id;

            return dispatch(storeInfoActions.set(store));
        }
        
        const existing = await DataStore.query(Store, store.id);

        if (!existing) {
            return console.log(`It seems that brand: ${store.id} has been removed`);
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
                updated.phone = store.phone;
            })
        );
        
        return dispatch(storeInfoActions.set(store));
    }

}
