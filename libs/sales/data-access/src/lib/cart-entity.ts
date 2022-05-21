export interface CartHeader {
    orderNumber: string;
    orderDate: string;
    user: string;
    status: string;
}

export interface CartProduct {
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