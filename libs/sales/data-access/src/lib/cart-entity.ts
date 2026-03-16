import {
    AppliedDiscountSummary,
    DiscountPricingSource,
    DiscountReconciliationStatus,
    EmployeeDiscountPolicy,
    ManualDiscountRequest,
    PriceOverrideRequest,
    PricingApprovalEvent,
} from '@pos/discounts/domain';
import { Product } from '@pos/shared/models';

type ProductLike = {
    id?: string | null;
    name: string;
    price: number;
    unitOfMeasure: string;
    barcode?: Product['barcode'];
    sku?: Product['sku'];
    isEBTEligible?: Product['isEBTEligible'];
    productCategoryId?: Product['productCategoryId'];
    discountable?: Product['discountable'];
    minAllowedPrice?: Product['minAllowedPrice'];
    maxManualDiscountPercent?: Product['maxManualDiscountPercent'];
    maxManualDiscountAmount?: Product['maxManualDiscountAmount'];
};

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
    categoryId?: string | null | undefined;
    unitOfMeasure: string;
    isEBTEligible?: boolean | null | undefined;
    discountable?: boolean;
    minAllowedPrice?: number | null;
    maxManualDiscountPercent?: number | null;
    maxManualDiscountAmount?: number | null;
}

export interface CartItem {
    identifier?: string;
    product: CartProduct;
    quantity: number;
}

export interface CartPromoCode {
    code: string;
}

export interface CartPayment {
    type: string;
    amount: number;
}

export interface CartFooter {
    baseSubtotal: number;
    subtotal: number;
    lineDiscountTotal: number;
    orderDiscountTotal: number;
    tax: number;
    discount: number;
    savingsTotal: number;
    total: number;
    pricingSource: DiscountPricingSource;
    reconciliationStatus: DiscountReconciliationStatus;
    payments?: CartPayment[];
}

export interface CartState {
    id?: string;
    orderNo?: string;
    header?: CartHeader;
    items: CartItem[];
    payments?: CartPayment[];
    footer: CartFooter;
    policy?: EmployeeDiscountPolicy;
    manualDiscounts: ManualDiscountRequest[];
    priceOverrides: PriceOverrideRequest[];
    promoCodes: CartPromoCode[];
    approvalEvents: PricingApprovalEvent[];
    appliedDiscountSummary?: AppliedDiscountSummary;
    selected?: CartItem;
}


export class CartItemMapper {
    static fromProduct(p: ProductLike, quantity: number): CartItem {
        return {
            identifier: undefined,
            product: {
                id: p.id!,
                name: p.name,
                price: p.price,
                categoryId: p.productCategoryId,
                unitOfMeasure: p.unitOfMeasure,
                barcode: p.barcode,
                sku: p.sku,
                isEBTEligible: p.isEBTEligible ?? false,
                discountable: p.discountable ?? true,
                minAllowedPrice: p.minAllowedPrice ?? null,
                maxManualDiscountPercent: p.maxManualDiscountPercent ?? null,
                maxManualDiscountAmount: p.maxManualDiscountAmount ?? null,
            },
            quantity,
        }
    }

}
