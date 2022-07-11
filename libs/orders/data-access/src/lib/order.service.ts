import { MutableModel } from '@aws-amplify/datastore';
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { Order, OrderLine, OrderMetaData, OrderStatus, Payment, PaymentInfo, Product, RefundInfo } from '@pos/shared/models';
import { DataStore } from 'aws-amplify';
import { OrderEntity, OrderEntityMapper } from './order.entity';
import { CartPayment, CartState } from '@pos/sales/data-access';
import { Alert } from 'react-native';
import moment from 'moment';
import { EmployeeEntity, EmployeeService } from '@pos/employees/data-access';
import { StationService } from '@pos/settings/data-access';
import { sortDescListBy, sortListBy } from '@pos/shared/utils';
import uuid from 'react-native-uuid';

export interface FilterRequest {
    status: OrderStatus;
    filter?: string;
}

export interface CreateOrderRequest {
    by: Omit<EmployeeEntity, 'id'> & { id: string };
    order: CartState;
}

export interface UpdateOrderRequest extends CreateOrderRequest {
    id: string;
    order: Omit<CartState, 'id'>;
}

export interface CloseOrderRequest extends UpdateOrderRequest {
    payments: CartPayment[];
}

export interface RefundOrderRequest extends UpdateOrderRequest {
    refundedLines: { identifier: string; quantity: number }[]
}

export interface UpsertOrderRequest extends CreateOrderRequest {
    status?: OrderStatus | keyof typeof OrderStatus;
    paymentInfo: PaymentInfo;
    refundInfo: RefundInfo;
}

export class OrderService {

    /**
     * Create a new order
     *
     * @static
     * @param {CreateOrderRequest} request
     * @return {Order} 
     * @memberof OrderService
     */
    static async create(request: CreateOrderRequest) {
        const order = new Order({
            orderNo: await StationService.getNextOrderNumber(request.by),
            status: 'OPEN',
            subtotal: request.order.footer.subtotal,
            tax: 0,
            total: request.order.footer.total,
            employeeId: request.by.id!,
            employeeName: `${request.by.firstName} ${request.by.lastName}`,
            lines: request.order.items.map(
                (i) =>
                    new OrderLine({
                        identifier: i.identifier || uuid.v4().toString(),
                        quantity: i.quantity,
                        tax: 0,
                        price: i.product.price,
                        productId: i.product.id!,
                        barcode: i.product.barcode,
                        sku: i.product.sku,
                        productName: i.product.name,
                        unitOfMeasure: i.product.unitOfMeasure,
                    })
            ),
            createdBy: {
                id: request.by.id,
                name: `${request.by.firstName} ${request.by.lastName}`
            },
            orderDate: moment().toISOString(),
        });

        return await DataStore.save(order);
    }

    /**
     * Allow you to update order products
     *
     * @static
     * @param {UpdateOrderRequest} request
     * @return {*}  {(Promise<Order | null>)}
     * @memberof OrderService
     */
    static async update(request: UpdateOrderRequest): Promise<Order | null> {
        const updatedOrder = await OrderService.getUpdatedOrder(request);

        if (!updatedOrder) return null;

        return await DataStore.save(updatedOrder);
    }

    static async closeOrder(request: CloseOrderRequest) {
        const updatedOrder = await OrderService.getUpdatedOrder(request, (o) => {
            o.status = 'PAID';
            o.updatedBy = {
                id: request.by.id,
                name: `${request.by.firstName} ${request.by.lastName}`
            };
            o.paymentInfo = {
                employeeId: request.by.id,
                employeeName: `${request.by.firstName} ${request.by.lastName}`,
                payments: request.payments?.map(p => new Payment({
                    type: p.type.toUpperCase() as any,
                    amount: p.amount
                }))
            };
        });

        if (!updatedOrder) return null;

        return await DataStore.save(updatedOrder);
    }

    static async refundOrder(request: RefundOrderRequest) {
        const existing = await DataStore.query(Order, request.id);
        
        if (!existing) {
            Alert.alert(`Order ${request.id} no found`);
            return null;
        }

        const refundedOrder = Order.copyOf(existing, (o) => {
            o.status = 'REFUNDED';
        });

        await DataStore.save(refundedOrder);
        await OrderService.updateInventory(refundedOrder);

        const cartOrder = OrderEntityMapper.asCartState(request.order);

        request.refundedLines.forEach((l) => {
            const line = cartOrder.items?.find(
                (li) => li.identifier === l.identifier && li.quantity > 0
            );

            if (line) {
                console.log(`Found product ${line.product.name}, removing 1`);
                line.quantity -= l.quantity;
            }
        });

        const newCart = await OrderEntityMapper.fromRefundedCart(
            request.by,
            cartOrder
        );

        if (!newCart.items?.length) return;

        await OrderService.create({
            by: ,// get original employee
            order: newCart
        }) // .upsertOrder(employee, newCart, OrderStatus.PAID);
    }


    private static async getUpdatedOrder(
        req: UpdateOrderRequest,
        cb?: (order: MutableModel<Order, OrderMetaData>
    ) => void) {
        const existing = await DataStore.query(Order, req.id);

        if (!existing) {
            Alert.alert(`It seems that order: ${req.id} does not exist`);
            return null;
        }

        return Order.copyOf(existing, (o) => {
            o.subtotal = req.order.footer.subtotal;
            o.tax = 0;
            o.total = req.order.footer.total;
            o.lines = req.order.items.map(
                (i) =>
                    new OrderLine({
                        identifier: i.identifier!,
                        quantity: i.quantity,
                        tax: 0,
                        price: i.product.price,
                        productId: i.product.id!,
                        barcode: i.product.barcode,
                        sku: i.product.sku,
                        productName: i.product.name,
                        unitOfMeasure: i.product.unitOfMeasure,
                    })
                );

                o.updatedBy = {
                    id: req.by.id,
                    name: `${req.by.firstName} ${req.by.lastName}`
                }

            if (!cb) return;

            cb(o);
        });
    }




    static async payOrder(employee: EmployeeEntity, cart: CartState, payments: CartPayment[]) {
        // if (!cart.header?.orderNumber) return;
        // const employee = (thunkAPI.getState() as RootState).employees.loginEmployee!;
        if (!cart.header?.employeeId) {
            Alert.alert('Employee is information is missing');
            return;
        }

        const createdBy = await EmployeeService.getById(cart.header.employeeId);

        if (!employee) {
            Alert.alert(`Employee id: ${cart.header.employeeId} could not be found`);
            return;
        }

        const o = await OrderService.upsertOrder(employee, cart, 'PAID', payments);

        if (!o) {
            Alert.alert(`Order ${cart.header.orderNumber} not found`);
            return;
        }

        const updatedOrder = Order.copyOf(o, (updated) => {
            updated.status = 'PAID';
        });

        const paidOrder = await DataStore.save(updatedOrder);
        await OrderService.updateInventory(updatedOrder);

        return paidOrder;
    }

    static async upsertOrder(request: UpsertOrderRequest) {
        if (!request.order.id) {
            const order = new Order({
                orderNo: await StationService.getNextOrderNumber(request.createdBy),
                status: request.status || 'OPEN',
                subtotal: request.order.footer.subtotal,
                tax: 0,
                total: request.order.footer.total,
                employeeId: request.createdBy.id!,
                employeeName: `${request.createdBy.firstName} ${request.createdBy.lastName}`,
                lines: request.order.items.map(
                    (i) =>
                        new OrderLine({
                            identifier: i.identifier || uuid.v4().toString(),
                            quantity: i.quantity,
                            tax: 0,
                            price: i.product.price,
                            productId: i.product.id!,
                            barcode: i.product.barcode,
                            sku: i.product.sku,
                            productName: i.product.name,
                            unitOfMeasure: i.product.unitOfMeasure,
                        })
                ),
                paymentInfo: {
                    employeeId: string;
                    employeeName: string;
                    payments: request.paymentInfo.payments?.map(p => new Payment({
                        type: p.type.toUpperCase() as any,
                        amount: p.amount
                    }))
                },
                orderDate: moment().toISOString(),
            });

            console.log('Order status: ' + status, order);

            return await DataStore.save(order);
        }

        const existing = await DataStore.query(Order, request.order.id);

        if (!existing) {
            return console.log(
                `It seems that order: ${createdBy.id} has been removed`
            );
        }

        const updatedOrder = Order.copyOf(existing, (o) => {
            o.status = status || 'OPEN';
            o.subtotal = request.order.footer.subtotal;
            o.tax = 0;
            o.total = request.order.footer.total;
            o.employeeId = createdBy.id!;
            o.employeeName = `${createdBy.firstName} ${createdBy.lastName}`;
            o.lines = request.order.items.map(
                (i) =>
                    new OrderLine({
                        identifier: i.identifier!,
                        quantity: i.quantity,
                        tax: 0,
                        price: i.product.price,
                        productId: i.product.id!,
                        barcode: i.product.barcode,
                        sku: i.product.sku,
                        productName: i.product.name,
                        unitOfMeasure: i.product.unitOfMeasure,
                    })
            );
            o.orderDate = moment().toISOString();
            o.payments = payments?.map(p => new Payment({
                type: p.type.toUpperCase() as any,
                amount: p.amount
            }));
        });

        console.log('Updated order', updatedOrder);
        
        return await DataStore.save(updatedOrder);
    }

    static async delete(id: string) {
        const item = await DataStore.query(Order, id);
        if (!item) return console.error(`Order Id: ${id} not found`);
        return DataStore.delete(item);
    }

    static async updateInventory(order: Order) {
        const promises: Promise<unknown>[] = [];
        order.lines.forEach((l) => {
            if (!l) return;

            promises.push(
                updateProductQuantity(order.status, l.productId, l.quantity)
            );
        });

        Promise.all(promises);
    }

    static search(items: OrderEntity[], options: FilterRequest) {
        // const lowerQuery = options.filter?.toLowerCase() || '';

        const searchResult = items.filter((i) => {
            return (
                i.status === options.status &&
                (!options.filter || i.orderNo?.indexOf(options.filter) !== -1)
            );
        });

        if (options.status === 'OPEN') {
            sortListBy(searchResult, 'createdAt');
        } else {
            sortDescListBy(searchResult, 'createdAt');
        }

        return searchResult;

        // items.forEach((e) => {
        //     if (e.status !== options.status) {
        //         return;
        //     }

        //     if (!lowerQuery) result.push(e);

        //     if (
        //         lowerQuery &&
        //         (e.id?.toLowerCase().indexOf(lowerQuery) !== -1 ||
        //             e.employeeName?.toLowerCase().indexOf(lowerQuery) !== -1)
        //     ) {
        //         result.push(e);
        //     }
        // });

        // return result;
    }

    static updateReorderPoint(id: string, value: number) {
        DataStore.query(Product, (p) => p.id('eq', id)).then((p) => {
            if (!p?.length) return;

            DataStore.save(
                Product.copyOf(p[0], (updated) => {
                    updated.reorderPoint = value;
                })
            );
        });
    }

    static updateReorderQuantity(id: string, value: number): void {
        DataStore.query(Product, (p) => p.id('eq', id)).then((p) => {
            if (!p?.length) return;

            DataStore.save(
                Product.copyOf(p[0], (updated) => {
                    updated.reorderQuantity = value;
                })
            );
        });
    }

    static async refund(
        employee: EmployeeEntity,
        originalOrder: OrderEntity,
        refundedLines: { identifier: string; price: number; quantity: number }[]
    ) {
        // First refund the entire original order
        const orders = await DataStore.query(Order, (o) =>
            o.id('eq', originalOrder.id)
        );
        const order = orders[0];
        if (!order) return;

        const refundedOrder = Order.copyOf(order, (o) => {
            o.status = OrderStatus.REFUNDED;
        });

        await DataStore.save(refundedOrder);
        await OrderService.updateInventory(refundedOrder);

        // then create a new one if necessary
        const cartOrder = OrderEntityMapper.asCartState(originalOrder);

        refundedLines.forEach((l) => {
            const line = cartOrder.items?.find(
                (li) => li.identifier === l.identifier && li.quantity > 0
            );

            if (line) {
                console.log(`Found product ${line.product.name}, removing 1`);
                line.quantity -= l.quantity;
            }
        });

        const newCart = await OrderEntityMapper.fromRefundedCart(
            employee,
            cartOrder
        );

        if (!newCart.items?.length) return;

        await OrderService.upsertOrder(employee, newCart, OrderStatus.PAID);
    }
}

async function updateProductQuantity(
    status: OrderStatus | keyof typeof OrderStatus,
    id: string,
    quantity: number
) {
    const p = await DataStore.query(Product, id);

    if (!p) return;

    const updatedProduct = Product.copyOf(p, (updated) => {
        switch (status) {
            case 'PAID':
                updated.quantity = -1 * quantity;
                break;
            case 'REFUNDED':
                updated.quantity = quantity;
                break;
            default:
                break;
        }
    });

    return DataStore.save(updatedProduct);
}
