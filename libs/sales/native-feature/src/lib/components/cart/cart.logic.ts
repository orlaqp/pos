import every from 'lodash/every';
import { CartItem, CartState } from '@pos/sales/data-access';
import { ProductEntity } from '@pos/products/data-access';

type ProductSummary = {
    product?: ProductEntity;
    totalQuantity: number;
    delta: number;
};

export const getEbtEligibleTotal = (cart: CartState): number =>
    cart.items.reduce((acc, item) => {
        if (!item.product.isEBTEligible) return acc;
        return acc + item.product.price * item.quantity;
    }, 0);

export const isCartReady = (cart: CartState): boolean =>
    cart.items.length > 0 && every(cart.items, (i) => i.quantity > 0);

export const getUnavailableProductMessages = (
    cartItems: CartItem[],
    products: ProductEntity[]
): string[] => {
    const summary: Record<string, ProductSummary> = {};

    cartItems.reduce((s, item) => {
        const product = products.find((x) => x.id === item.product.id);
        const pSummary: ProductSummary = s[item.product.id] || {
            product,
            totalQuantity: 0,
            delta: 0,
        };

        pSummary.totalQuantity += item.quantity;
        pSummary.delta = (product?.quantity || 0) - pSummary.totalQuantity;
        summary[item.product.id] = pSummary;

        return summary;
    }, summary);

    return Object.keys(summary)
        .filter((x) => summary[x].delta < 0)
        .map((x) => `${summary[x].product?.name || x} -> ${summary[x].delta}`);
};
