import {
    Brand,
    Category,
    Customer,
    Employee,
    GlobalSettings,
    InventoryChanges,
    InventoryCount,
    InventoryCountLine,
    InventoryReceive,
    InventoryReceiveLine,
    Order,
    Printer,
    Product,
    Station,
    Store,
    UnitOfMeasure,
} from '@pos/shared/models';
import { getCurrentTenantId } from '@pos/auth/data-access';
import { DataStore, syncExpression } from '@pos/shared/amplify';
import moment from 'moment';

export const configureDataStore = () => {
    console.log('Configuring data store sync expressions');

    const tenantId = getCurrentTenantId();
    if (!tenantId) {
        console.log('Skipping DataStore sync configuration until tenant is resolved');
        return;
    }

    const isoDate = moment().subtract(90, 'days').toISOString();

    DataStore.configure({
        errorHandler: (error: unknown) => {
            console.error('DataStore sync error', error);
        },
        syncExpressions: [
            syncExpression(Store, () => (x: any) => x.tenantId.eq(tenantId)),
            syncExpression(Brand, () => (x: any) => x.tenantId.eq(tenantId)),
            syncExpression(Category, () => (x: any) => x.tenantId.eq(tenantId)),
            syncExpression(Customer, () => (x: any) => x.tenantId.eq(tenantId)),
            syncExpression(Employee, () => (x: any) => x.tenantId.eq(tenantId)),
            syncExpression(Product, () => (x: any) => x.tenantId.eq(tenantId)),
            syncExpression(UnitOfMeasure, () => (x: any) => x.tenantId.eq(tenantId)),
            syncExpression(InventoryChanges, () => (x: any) => x.tenantId.eq(tenantId)),
            syncExpression(
                InventoryCount,
                () => (x: any) => x.and((count: any) => [count.tenantId.eq(tenantId), count.createdAt.gt(isoDate)])
            ),
            syncExpression(
                InventoryCountLine,
                () => (x: any) => x.and((line: any) => [line.tenantId.eq(tenantId), line.createdAt.gt(isoDate)])
            ),
            syncExpression(
                InventoryReceive,
                () => (x: any) => x.and((receive: any) => [receive.tenantId.eq(tenantId), receive.createdAt.gt(isoDate)])
            ),
            syncExpression(
                InventoryReceiveLine,
                () => (x: any) => x.and((line: any) => [line.tenantId.eq(tenantId), line.createdAt.gt(isoDate)])
            ),
            syncExpression(
                Order,
                () => (x: any) => x.and((order: any) => [order.tenantId.eq(tenantId), order.orderDate.gt(isoDate)])
            ),
            syncExpression(Printer, () => (x: any) => x.tenantId.eq(tenantId)),
            syncExpression(Station, () => (x: any) => x.tenantId.eq(tenantId)),
            syncExpression(GlobalSettings, () => (x: any) => x.tenantId.eq(tenantId)),
        ],
    });
};
