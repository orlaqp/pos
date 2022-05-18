import { ProductEntity } from '@pos/products/data-access';

export interface CartHeader {
    orderNumber: string;
    orderDate: string;
    user: string;
    status: string;
}

export interface CartItem {
    id?: string;
    product: ProductEntity;
    quantity: number;
}

export interface CartFooter {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
}

export interface CartState {
    header?: CartHeader;
    items: CartItem[];
    footer: CartFooter;
    selected?: CartItem;
}