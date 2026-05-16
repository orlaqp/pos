import every from 'lodash/every';
import {
    AppliedDiscountDetail,
    AppliedDiscountSummary,
} from '@pos/discounts/domain';
import { CartItem, CartState } from '@pos/sales/data-access';
import { ProductEntity } from '@pos/products/data-access';

type ProductSummary = {
    product?: ProductEntity;
    totalQuantity: number;
    delta: number;
};

export interface OrderSummaryLine {
    id: string;
    name: string;
    quantity: number;
    unitLabel: string;
    unitPrice: number;
    originalTotal: number;
    finalTotal: number;
    savings: number;
    discounts: AppliedDiscountDetail[];
}

export interface OrderSummaryViewModel {
    lines: OrderSummaryLine[];
    promoCodes: string[];
    warnings: string[];
    subtotal: number;
    discountTotal: number;
    tax: number;
    total: number;
    savingsTotal: number;
    ebtEligibleTotal: number;
}

export interface SummaryDiscountBreakdownItem {
    discountApplicationId: string;
    name: string;
    discountAmount: number;
    scope: 'LINE' | 'ORDER';
}

const getLineFinalTotal = (cart: CartState, item: CartItem): number => {
    const lineId = item.identifier || item.product.id;
    const lineSummary = cart.appliedDiscountSummary?.lineSummaries?.find(
        (summary) => summary.lineId === lineId
    );

    return lineSummary?.lineTotalBeforeTax ?? item.product.price * item.quantity;
};

const getLineDisplayTotal = (cart: CartState, item: CartItem): number => {
    const lineId = item.identifier || item.product.id;
    const lineSummary = cart.appliedDiscountSummary?.lineSummaries?.find(
        (summary) => summary.lineId === lineId
    );
    const chargedTotal = lineSummary?.lineTotalBeforeTax ?? item.product.price * item.quantity;

    return chargedTotal + (lineSummary?.allocatedOrderDiscountTotal || 0);
};

export const getEbtEligibleTotal = (cart: CartState): number =>
    cart.items.reduce((acc, item) => {
        if (!item.product.isEBTEligible) return acc;
        return acc + getLineFinalTotal(cart, item);
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

export const buildOrderSummary = (cart: CartState): OrderSummaryViewModel => {
    const lineSummaries = cart.appliedDiscountSummary?.lineSummaries || [];

    return {
        lines: cart.items.map((item) => {
            const lineId = item.identifier || item.product.id;
            const lineSummary = lineSummaries.find((summary) => summary.lineId === lineId);
            const originalTotal = item.product.price * item.quantity;
            const finalTotal = getLineDisplayTotal(cart, item);
            const savings = lineSummary?.lineDiscountTotal || 0;

            return {
                id: lineId,
                name: item.product.name,
                quantity: item.quantity,
                unitLabel: item.product.unitOfMeasure.toLowerCase(),
                unitPrice: item.product.price,
                originalTotal,
                finalTotal,
                savings,
                discounts: lineSummary?.discounts || [],
            };
        }),
        promoCodes: cart.promoCodes.map((promo) => promo.code),
        warnings: cart.appliedDiscountSummary?.warnings || [],
        subtotal: cart.footer.subtotal,
        discountTotal: cart.footer.discount,
        tax: cart.footer.tax,
        total: cart.footer.total,
        savingsTotal: cart.footer.savingsTotal,
        ebtEligibleTotal: getEbtEligibleTotal(cart),
    };
};

export const buildDiscountBreakdown = (
    summary?: AppliedDiscountSummary | null
): SummaryDiscountBreakdownItem[] => [
    ...((summary?.lineSummaries || []).flatMap((lineSummary) =>
        lineSummary.discounts.map((discount) => ({
            discountApplicationId: discount.discountApplicationId,
            name:
                discount.applicationType === 'PRICE_OVERRIDE'
                    ? 'Price override'
                    : discount.code || discount.name,
            discountAmount: discount.discountAmount,
            scope: 'LINE' as const,
        }))
    )),
    ...((summary?.orderLevelAdjustments || []).map((discount) => ({
        discountApplicationId: discount.discountApplicationId,
        name: discount.name,
        discountAmount: discount.discountAmount,
        scope: 'ORDER' as const,
    }))),
];
