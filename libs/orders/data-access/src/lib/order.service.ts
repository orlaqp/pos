import { Order, OrderLine } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { OrderEntity, OrderEntityMapper } from './order.entity';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { CartState } from '@pos/sales/data-access';
import { ordersActions } from './slices/orders.slice';
import { Alert } from 'react-native';
import { DatesService } from '@pos/shared/utils';

export class OrderService {
    
    static async payOrder(cart: CartState) {
        if (!cart.header?.orderNumber) return;

        const o = await DataStore.query(Order, cart.header.orderNumber);

        if (!o) {
            Alert.alert(`Order ${cart.header.orderNumber} not found`);
            return;
        }

        const updatedOrder = Order.copyOf(o, (updated) => {
            updated.status = 'PAID';
        });

        return await DataStore.save(updatedOrder);
    }
    
    // static async getFullOrder(id: string) {
    //     const o = await DataStore.query(Order, id);
    //     // const lines = await DataStore.query(OrderLine, ol => ol.orderID(''))

    //     if (!o) {
    //         Alert.alert(`Order ${id} not found`);
    //         return;
    //     }

    //     const items = await DataStore.query(OrderLine, l => l.orderID('eq', id));

    //     return {
    //         id: o.id,
    //         status: o.status,
    //         subtotal: o.subtotal,
    //         tax: o.tax,
    //         total: o.total,
    //         createdAt: o.createdAt,
    //         updatedAt: o.updatedAt,
    //         items: items.map(i => ({
    //             id: i.id,
    //             orderID: i.orderID,
    //             price: i.price,
    //             productId: i.productId,
    //             barcode: i.barcode,
    //             sku: i.sku,
    //             productName: i.productName,
    //             quantity: i.quantity,
    //             tax: i.tax,
    //             unitOfMeasure: i.unitOfMeasure,
    //             discountType: i.discountType,
    //             discountValue: i.discountValue,
    //             createdAt: i.createdAt,
    //             updatedAt: i.updatedAt
    //         }))
    //     } as OrderEntity;
    // }
    
    static async saveOrder(state: CartState) {
        let o = new Order({
            status: 'OPEN',
            subtotal: state.footer.subtotal,
            tax: 0,
            total: state.footer.total,
        });
    
        o = await DataStore.save(o);
        
        const promises: Promise<unknown>[] = [];
        state.items.forEach((i) => {
            const ol = new OrderLine({
                orderID: o.id,
                quantity: i.quantity,
                tax: 0,
                price: i.product.price,
                productId: i.product.id!,
                barcode: i.product.barcode,
                sku: i.product.sku,
                productName: i.product.name,
                unitOfMeasure: i.product.unitOfMeasure,
            });
            promises.push(DataStore.save(ol));
        });
    
        await Promise.all(promises);
    
        return o;
    }

    static async delete(id: string) {
        const item = await DataStore.query(Order, id);
        if (!item)
            return console.error(`Order Id: ${id} not found`);
        
        // TODO: Do any extra cleanup here like for example remove image
        // if (item.picture)
        //     AssetsService.deleteAsset(item.picture);

        return DataStore.delete(item);
    }
}

export function observeOpenOrderChanges(dispatch: Dispatch) {
    const sevenDaysAgo = DatesService.daysAgo(7);
    const isoDate = DatesService.toISO8601(sevenDaysAgo);

    DataStore.observeQuery(Order, (o) => o.createdAt('gt', isoDate)).subscribe(
        ({ isSynced, items }) => {
            if (isSynced) {
                dispatch(
                    ordersActions.setAll(
                        items.map((i) => OrderEntityMapper.fromModel(i))
                    )
                );
            }
        },
        (error) => {
            dispatch(ordersActions.submitError(error.message));
        }
    );

    DataStore.observeQuery(OrderLine, (o) => o.createdAt('gt', isoDate)).subscribe(
        ({ isSynced, items }) => {
            if (isSynced) {
                dispatch(
                    ordersActions.setLines(
                        items.map((i) => OrderEntityMapper.fromLine(i))
                    )
                );
            }
        },
        (error) => {
            dispatch(ordersActions.submitError(error.message));
        }
    );
};
