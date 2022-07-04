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
    id?: string;
    product: CartProduct;
    quantity: number;
}

export class CartItemMapper {
    static fromProduct(p: Product, quantity: number): CartItem {
        return {
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

export interface CartFooter {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
}

export interface CartState {
    id?: string;
    orderNo?: string;
    header?: CartHeader;
    items: CartItem[];
    footer: CartFooter;
    selected?: CartItem;
}