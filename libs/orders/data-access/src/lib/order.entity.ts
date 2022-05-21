import { Order, OrderLine, OrderStatus } from '@pos/shared/models';

export interface OrderEntity {
    id: string;
    subtotal: number;
    tax: number;
    total: number;
    status: OrderStatus | keyof typeof OrderStatus;
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

    static composeOrders(orders: OrderEntity[], lines: OrderLineEntity[]): OrderEntity[] {
        return orders.map(o => ({
            ...o,
            items: lines?.filter(l => l.orderID === o.id)
        }))
    }
}
