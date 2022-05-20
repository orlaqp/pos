import { DataStore } from 'aws-amplify';
import { CartState } from './cart-entity';
import { Order, OrderLine } from '@pos/shared/models';
import { orderActions } from './slices/order.slice';
import { OrderEntityMapper } from './order.entity';
import { Dispatch } from '@reduxjs/toolkit';

export const saveOrder = async (state: CartState) => {
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
};

export const observeOpenOrderChanges = (dispatch: Dispatch) => {
    DataStore.observeQuery(Order, (o) => o.status('eq', 'CREATED')).subscribe(
        ({ isSynced, items }) => {
            if (isSynced) {
                dispatch(
                    orderActions.setAll(
                        items.map((i) => OrderEntityMapper.fromModel(i))
                    )
                );
            }
        },
        (error) => {
            dispatch(orderActions.error(error));
        }
    );
};