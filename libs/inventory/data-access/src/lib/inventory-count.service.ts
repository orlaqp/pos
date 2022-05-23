
import { Inventory } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { inventoriesActions } from './slices/inventory.slice';
import { InventoryEntity } from './inventory.entity';

export class InventoryService {
    static async save(dispatch: Dispatch<any>, inventory: InventoryEntity) {
        if (!inventory.id) {
            const entity = new Inventory(inventory);
            const res = await DataStore.save(entity);

            inventory.id = res.id;

            return dispatch(inventoriesActions.add(inventory));
        }
        
        const existing = await DataStore.query(Inventory, inventory.id);

        if (!existing) {
            return console.log(`It seems that inventory: ${inventory.id} has been removed`);
        }

        await DataStore.save(
            Inventory.copyOf(existing, updated => {
                // TODO: Update inventory properties here
            })
        );
        
        return dispatch(inventoriesActions.update({ id: inventory.id, changes: inventory }));
    }

    static getAll() {
        return DataStore.query(Inventory);
    }

    static async delete(id: string) {
        const item = await DataStore.query(Inventory, id);
        if (!item)
            return console.error(`Inventory Id: ${id} not found`);
        
        // TODO: Do any extra cleanup here like for example remove image
        // if (item.picture)
        //     AssetsService.deleteAsset(item.picture);

        return DataStore.delete(item);
    }
}
