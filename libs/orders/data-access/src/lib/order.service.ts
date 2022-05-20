
import { Order, OrderLine } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { OrderEntityMapper } from './order.entity';
import { CartState } from '@pos/sales/data-access';
import { ordersActions } from './slices/orders.slice';


export class OrderService {
    static async saveOrder(state: CartState) {
        let o = new Order({
            orderNo: '1',
            status: 'CREATED',
            subtotal: state.footer.subtotal,
            tax: 0,
            total: state.footer.total,
        });
    
        o = await DataStore.save(o);
        
        const promises: Promise<unknown>[] = [];
        const oLines = state.items.forEach((i) => {
            const ol = new OrderLine({
                orderID: o.id,
                quantity: i.quantity,
                tax: 0,
                price: i.product.price,
                productId: i.product.id!,
                productName: i.product.name,
                unitOfMeasure: i.product.unitOfMeasure,
            });
            promises.push(DataStore.save(ol));
        });
    
        await Promise.all(promises);
    
        return o;
    }

    static observeOpenOrderChanges(dispatch: Dispatch) {
        DataStore.observeQuery(Order, (o) => o.status('eq', 'CREATED')).subscribe(
            ({ isSynced, items }) => {
                if (isSynced) {
                    dispatch(
                        ordersActions.addMany(
                            items.map((i) => OrderEntityMapper.fromModel(i))
                        )
                    );
                }
            },
            (error) => {
                dispatch(ordersActions.submitError(error.message));
            }
        );
    };

    static getOpenOrders() {
        return DataStore.query(Order, o => o.status('eq', 'CREATED'));
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
