import {
    Order,
    OrderLine,
    InventoryCount,
    InventoryCountLine,
    InventoryReceive,
    InventoryReceiveLine,
    Printer,
    Station,
} from '@pos/shared/models';
import { DatesService } from '@pos/shared/utils';
import { DataStore, syncExpression } from 'aws-amplify';
import DeviceInfo from 'react-native-device-info';
import moment from 'moment';


const deviceId = DeviceInfo.getUniqueId();

export const configureDataStore = () => {
    console.log('Configuring data store sync expressions');
    const last90Days = moment().subtract(90, 'days');
    const lastMonth = moment().subtract(30, 'days');
    const isoDate = last90Days.toISOString();
    
    /**
     * "Printer",
     * "Tag",
     * "PurchaseOrder",
     * "Inventory",
     * "InventoryCountLine",
     * "Category",
     * "Supplier",
     * "PurchaseOrderLine",
     * "InventoryReceiveLine",
     * "Customer",
     * "UnitOfMeasure",
     * "Station",
     * "OrderLine",
     * "InventoryChanges",
     * "InventoryReceive",
     * "Stock",
     * "Product",
     * "Store",
     * "InventoryCount",
     * "Order",
     * "Brand"
     */
    // 

    DataStore.configure({
        syncExpressions: [
            // syncExpression(Order, () => (x) => x.createdAt('gt', lastMonth.toISOString())),
            // syncExpression(Order, () => (x) => x.total('gt', 300)),
            syncExpression(
                InventoryCount,
                () => (x) => x.createdAt('gt', isoDate)
            ),
            syncExpression(
                InventoryCountLine,
                () => (x) => x.createdAt('gt', isoDate)
            ),
            syncExpression(
                InventoryReceive,
                () => (x) => x.createdAt('gt', isoDate)
            ),
            syncExpression(
                InventoryReceiveLine,
                () => (x) => x.createdAt('gt', isoDate)
            ),
            syncExpression(
                Printer,
                () => (x) => x.deviceId('eq', deviceId)
            ),
            syncExpression(
                Station,
                () => (x) => x.deviceId('eq', deviceId)
            ),
        ],
    });
};
