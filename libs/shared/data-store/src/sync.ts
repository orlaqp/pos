/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { syncBrands } from '@pos/brands/data-access';
import { syncCategories } from '@pos/categories/data-access';
import { syncEmployees } from '@pos/employees/data-access';
import { syncInventoryCountLines, syncInventoryCounts, syncInventoryReceiveLines, syncInventoryReceives } from '@pos/inventory/data-access';
import { syncOrders } from '@pos/orders/data-access';
import { syncDefaultPrinter } from '@pos/printings/data-access';
import { syncProducts } from '@pos/products/data-access';
import { syncStoreInfo } from '@pos/store-info/data-access';
import { syncUnitOfMeasures } from '@pos/unit-of-measures/data-access';
import { Dispatch } from '@reduxjs/toolkit';

export const syncModelsWithStore = (dispatch: Dispatch, model: string) => {
    console.log(`*** Syncing ${model} with store ***`);

    switch (model) {
        case 'Printer':
            syncDefaultPrinter(dispatch);
            break;
        // case 'Tag':
        //     sync...(dispatch);
        //     break;
        // case 'PurchaseOrder':
        //     sync...(dispatch);
        //     break;
        // case 'Inventory':
        //     sync...(dispatch);
        //     break;
        case 'InventoryCountLine':
            syncInventoryCountLines(dispatch);
            break;
        case 'Category':
            syncCategories(dispatch);
            break;
        // case 'Supplier':
        //     sync...(dispatch);
        //     break;
        // case 'PurchaseOrderLine':
        //     sync...(dispatch);
        //     break;
        case 'InventoryReceiveLine':
            syncInventoryReceiveLines(dispatch);
            break;
        // case 'Customer':
        //     sync...(dispatch);
        //     break;
        case 'UnitOfMeasure':
            syncUnitOfMeasures(dispatch);
            break;
        // case 'Station':
        //     syncStations(dispatch);
        //     break;
        // case 'InventoryChanges':
        //     sync...(dispatch);
        //     break;
        case 'InventoryReceive':
            syncInventoryReceives(dispatch);
            break;
        // case 'Stock':
        //     sync...(dispatch);
        //     break;
        case 'Product':
            syncProducts(dispatch);
            break;
        case 'Store':
            syncStoreInfo(dispatch);
            break;
        case 'InventoryCount':
            syncInventoryCounts(dispatch);
            break;
        case 'Order':
            syncOrders(dispatch);
            break;
        case 'Brand':
            syncBrands(dispatch);
            break;
        case 'Employee':
            syncEmployees(dispatch);
            break;
        default:
            break;
    }
};

// const updateStore = (dispatch: Dispatch, model: any, action: (models: unknown[]) => AnyAction) => {
//     console.log('Syncing products to the store');
//     DataStore.query(model).then((items) =>
//         dispatch(action(items))
//     );
// };
