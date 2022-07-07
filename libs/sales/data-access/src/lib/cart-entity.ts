import { PaymentEntity } from '@pos/orders/data-access';
import { Product } from '@pos/shared/models';

export interface CartHeader {
    orderNumber: string;
    orderDate: string;
    employeeId: string;
    employeeName: string;
    status: string;
}

export interface CartProduct {
    id: string;
    barcode?: string | null | undefined;
    sku?: string | null | undefined;
    name: string;
    price: number;
    unitOfMeasure: string;
}

export interface CartItem {
    identifier?: string;
    product: CartProduct;
    quantity: number;
}

export interface CartPayment {
    type: string;
    amount: number;
}

export interface CartFooter {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    payments?: CartPayment[];
}

export interface CartState {
    id?: string;
    orderNo?: string;
    header?: CartHeader;
    items: CartItem[];
    payments?: PaymentEntity[];
    footer: CartFooter;
    selected?: CartItem;
}


export class CartItemMapper {
    static fromProduct(p: Product, quantity: number): CartItem {
        return {
            identifier: undefined,
            product: {
                id: p.id!,
                name: p.name,
                price: p.price,
                unitOfMeasure: p.unitOfMeasure,
                barcode: p.barcode,
                sku: p.sku,
            },
            quantity,
        }
    }

}