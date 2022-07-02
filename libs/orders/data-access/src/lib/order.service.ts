import { Order, OrderLine, OrderStatus, Product } from '@pos/shared/models';
import { DataStore } from 'aws-amplify';
import { OrderEntity, OrderEntityMapper } from './order.entity';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { CartState } from '@pos/sales/data-access';
import { Alert } from 'react-native';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { User } from '@pos/auth/data-access';
import moment from 'moment';
import { EmployeeEntity } from '@pos/employees/data-access';

export interface FilterRequest {
    status: OrderStatus;
    filter?: string;
}

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

        const paidOrder = await DataStore.save(updatedOrder);
        await OrderService.updateInventory(updatedOrder);

        return paidOrder;
    }

    static async saveOrder(
        employee: EmployeeEntity,
        state: CartState,
        status?: OrderStatus | keyof typeof OrderStatus
    ) {
        if (!state.id) {
            const order = new Order({
                status: status || 'OPEN',
                subtotal: state.footer.subtotal,
                tax: 0,
                total: state.footer.total,
                employeeId: employee.id!,
                employeeName: `${employee.firstName} ${employee.lastName}`,
                lines: state.items.map(
                    (i) =>
                        new OrderLine({
                            identifier: i.id!,
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
                orderDate: moment().toISOString(),
            });

            return await DataStore.save(order);
        }

        const existing = await DataStore.query(Order, state.id);

        if (!existing) {
            return console.log(`It seems that order: ${employee.id} has been removed`);
        }

        return await DataStore.save(
            Order.copyOf(existing, o => {
                o.status = status || 'OPEN';
                o.subtotal = state.footer.subtotal;
                o.tax = 0;
                o.total = state.footer.total;
                o.employeeId = employee.id!;
                o.employeeName = `${employee.firstName} ${employee.lastName}`;
                o.lines = state.items.map(
                    (i) =>
                        new OrderLine({
                            identifier: i.id!,
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
            })
        );

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
        const result: OrderEntity[] = [];
        const lowerQuery = options.filter?.toLowerCase();

        items.forEach((e) => {
            if (e.status !== options.status) {
                return;
            }

            if (!lowerQuery) result.push(e);

            if (
                lowerQuery &&
                (e.id?.toLowerCase().indexOf(lowerQuery) !== -1 ||
                    e.employeeName?.toLowerCase().indexOf(lowerQuery) !== -1)
            ) {
                result.push(e);
            }
        });

        return result;
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
        oldOrder: OrderEntity,
        lines: { id: string; price: number; quantity: number }[]
    ) {
        // First refund the entire original order
        const orders = await DataStore.query(Order, (o) =>
            o.id('eq', oldOrder.id)
        );
        const order = orders[0];
        if (!order) return;

        const newOrder = Order.copyOf(order, (o) => {
            o.status = OrderStatus.REFUNDED;
        });

        await DataStore.save(newOrder);
        await OrderService.updateInventory(newOrder);

        // then create a new one if necessary
        const cartOrder = OrderEntityMapper.asCartState(oldOrder);

        lines.forEach((l) => {
            const line = cartOrder.items?.find(
                (li) => li.id === l.id && li.quantity > 0
            );

            if (line) {
                console.log(`Found product ${line.product.name}, removing 1`);
                line.quantity -= l.quantity;
            }
        });

        // cartOrder.items = cartOrder.items?.filter(l => l.quantity > 0);
        const newCart = OrderEntityMapper.fromRefundedCart(employee, cartOrder);

        if (!newCart.items?.length) return;

        await OrderService.saveOrder(employee, newCart, OrderStatus.PAID);
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
