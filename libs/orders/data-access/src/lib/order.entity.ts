import { Order, OrderStatus } from '@pos/shared/models';

export interface OrderEntity {
  id: string;
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus | keyof typeof OrderStatus;
  items?: (OrderLineEntity | null)[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface OrderLineEntity {
  id: string;
  productId: string;
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
            items: p.OrderItems?.map(i => {
                if (!i) return null;

                return {
                    id: i?.id,
                    orderID: p.id,
                    productId: i?.productId,
                    productName: i?.productName,
                    quantity: i?.quantity,
                    tax: 0,
                    price: i.price,
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