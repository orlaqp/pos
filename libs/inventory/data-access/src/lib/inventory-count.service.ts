
import { InventoryCount, Product } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { inventoryCountActions } from './slices/inventory-count.slice';
import { InventoryCountDTO } from './inventory-count.entity';

export class InventoryCountService {
    static async save(dispatch: Dispatch<any>, count: InventoryCountDTO) {
        if (!count.id) {
            const entity = new InventoryCount(count);
            const res = await DataStore.save(entity);

            count.id = res.id;

            return dispatch(inventoryCountActions.add(count));
        }
        
        const existing = await DataStore.query(InventoryCount, count.id);

        if (!existing) {
            return console.log(`It seems that inventory: ${count.id} has been removed`);
        }

        await DataStore.save(
            InventoryCount.copyOf(existing, updated => {
                updated.comments = count.comments
            })
        );
        
        return dispatch(inventoryCountActions.update({ id: count.id, changes: count }));
    }

    static getAll() {
        return DataStore.query(InventoryCount);
    }

    static async delete(id: string) {
        const item = await DataStore.query(InventoryCount, id);
        if (!item)
            return console.error(`Inventory Id: ${id} not found`);
        
        // TODO: Do any extra cleanup here like for example remove image
        // if (item.picture)
        //     AssetsService.deleteAsset(item.picture);

        return DataStore.delete(item);
    }

    static reset() {

    }

    static addProduct(product: Product) {

    }
}
