
import { Printer } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { printingsActions } from './slices/printings.slice';
import { PrintingEntity } from './printing.entity';

export class PrintingService {
    static async save(dispatch: Dispatch<any>, printing: PrintingEntity) {
        if (!printing.id) {
            const entity = new Printer(printing);
            const res = await DataStore.save(entity);

            printing.id = res.id;

            return dispatch(printingsActions.add(printing));
        }
        
        const existing = await DataStore.query(Printer, printing.id);

        if (!existing) {
            return console.log(`It seems that printing: ${printing.id} has been removed`);
        }

        await DataStore.save(
            Printer.copyOf(existing, updated => {
                // TODO: Update printing properties here
            })
        );
        
        return dispatch(printingsActions.update({ id: printing.id, changes: printing }));
    }

    static getAll() {
        return DataStore.query(Printer);
    }

    static async delete(id: string) {
        const item = await DataStore.query(Printer, id);
        if (!item)
            return console.error(`Printing Id: ${id} not found`);
        
        // TODO: Do any extra cleanup here like for example remove image
        // if (item.picture)
        //     AssetsService.deleteAsset(item.picture);

        return DataStore.delete(item);
    }
}
