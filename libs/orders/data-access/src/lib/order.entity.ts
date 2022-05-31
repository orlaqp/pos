// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { CartState, initialCartState } from '@pos/sales/data-access';
import { Order, OrderLine, OrderStatus } from '@pos/shared/models';

export interface OrderEntity {
    id: string;
    subtotal: number;
    tax: number;
    total: number;
    status: OrderStatus | keyof typeof OrderStatus;
    employeeId: string,
    employeeName: string,
    items?: OrderLineEntity[] | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface OrderLineEntity {
    id?: string;
    productId: string;
    barcode: string | null | undefined;
    sku: string | null | undefined;
    productName: string;
    unitOfMeasure: string;
    quantity: number;
    tax: number;
    price: number;
    discountType?: string | null;
    discountValue?: number | null;
    orderID: string;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export class OrderEntityMapper {
    static fromModel(p: Order): OrderEntity {
        return {
            id: p.id,
            subtotal: p.subtotal,
            tax: p.tax,
            total: p.total,
            status: p.status,
            employeeId: p.employeeId,
            employeeName: p.employeeName,
            items: p.OrderItems?.filter((i) => i !== null).map((i) =>
                OrderEntityMapper.fromLine(i!)
            ),
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }

    static fromLine(l: OrderLine): OrderLineEntity {
        return {
            id: l.id,
            orderID: l.orderID,
            productId: l.productId,
            barcode: l.barcode,
            sku: l.sku,
            productName: l.productName,
            quantity: l.quantity,
            tax: 0,
            price: l.price,
            unitOfMeasure: l.unitOfMeasure,
            createdAt: l.createdAt,
            updatedAt: l.updatedAt,
        };
    }

    static asCartState(o: OrderEntity): CartState {
        const state: CartState = { ...initialCartState };

        state.footer = {
            discount: 0,
            subtotal: o.subtotal,
            tax: o.tax,
            total: o.total,
        };
        state.header = {
            orderDate: o.createdAt!,
            orderNumber: o.id,
            status: o.status,
            employeeId: '',
            employeeName: ''
        };
        state.items = o.items?.map((i) => ({
            quantity: i?.quantity,
            id: i?.id,
            product: {
                id: i.productId,
                name: i?.productName,
                price: i?.price,
                unitOfMeasure: i?.unitOfMeasure,
                barcode: i.barcode,
                sku: i.sku,
            },
        }));
        state.selected = initialCartState.selected;

        return state;
    }

    static composeOrders(
        orders: OrderEntity[],
        lines: OrderLineEntity[]
    ): OrderEntity[] {
        return orders.map((o) => ({
            ...o,
            items: lines?.filter((l) => l.orderID === o.id),
        }));
    }
}
