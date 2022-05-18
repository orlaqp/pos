import { Order, OrderStatus } from '@pos/shared/models';

export interface OrderEntity {
  readonly id: string;
  readonly orderNo: string;
  readonly subtotal: number;
  readonly tax: number;
  readonly total: number;
  readonly status: OrderStatus | keyof typeof OrderStatus;
  readonly items?: (OrderLineEntity | null)[] | null;
//   readonly Customer?: Customer | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
//   readonly orderCustomerId?: string | null;
}

export interface OrderLineEntity {
  readonly id: string;
  readonly productId: string;
  readonly productName: string;
  readonly unitOfMeasure: string;
  readonly quantity: number;
  readonly tax: number;
  readonly discountType?: string | null;
  readonly discountValue?: number | null;
  readonly orderID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export class OrderEntityMapper {
    static fromModel(p: Order): OrderEntity {
        return {
            id: p.id,
            orderNo: p.orderNo,
            subtotal: p.subtotal,
            tax: p.tax,
            total: p.total,
            status: p.status,
            items: p.OrderItems?.map(i => {
                if (!i) return null;

                return {
                    id: i?.id,
                    orderID: p.id,
                    productId: i?.productId,
                    productName: i?.productName,
                    quantity: i?.quantity,
                    tax: 0,
                    unitOfMeasure: i?.unitOfMeasure,
                    createdAt: i?.createdAt,
                    updatedAt: i?.updatedAt
                }
            }),
            createdAt: p.createdAt,
            updatedAt: p.updatedAt
        }
    }
}