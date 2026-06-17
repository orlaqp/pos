// eslint-disable-next-line @nx/enforce-module-boundaries
import type { RootState } from '@pos/store';
import {
    AppliedDiscountSummary,
    PricingEngine,
    restoreDiscountStateFromSummary,
} from '@pos/discounts/domain';
import {
    createSelector,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import {
    CartCustomer,
    CartItem,
    CartPayment,
    CartState,
    CartPromoCode,
} from '../cart-entity';
import uuid from 'react-native-uuid';

type OrderLineLike = {
    quantity: number;
    identifier?: string;
    productId: string;
    productName: string;
    basePrice?: number;
    overridePrice?: number | null;
    netUnitPrice?: number;
    lineSubtotalBeforeOrderDiscount?: number;
    lineDiscountTotal?: number;
    allocatedOrderDiscountTotal?: number;
    lineTotalBeforeTax?: number;
    lineTotalAfterTax?: number;
    appliedDiscounts?: import('@pos/discounts/domain').AppliedDiscountDetail[] | string | null;
    price: number;
    unitOfMeasure: string;
    categoryId?: string | null;
    discountable?: boolean | null;
    minAllowedPrice?: number | null;
    maxManualDiscountPercent?: number | null;
    maxManualDiscountAmount?: number | null;
    isEBTEligible?: boolean | null;
};

type OrderEntityLike = {
    id: string;
    orderNo?: string;
    orderDate?: string;
    status: string;
    employeeId: string;
    employeeName: string;
    baseSubtotal?: number;
    lineDiscountTotal?: number;
    orderDiscountTotal?: number;
    discountTotal?: number;
    savingsTotal?: number;
    pricingSource?: CartState['footer']['pricingSource'];
    reconciliationStatus?: CartState['footer']['reconciliationStatus'];
    promoCodes?: (string | null)[] | null;
    appliedDiscountSummary?: AppliedDiscountSummary | string | null;
    subtotal: number;
    tax: number;
    total: number;
    lines?: OrderLineLike[];
    customer?: CartCustomer;
};

const parseAppliedDiscountSummary = (
    value: AppliedDiscountSummary | string | null | undefined
) => {
    if (!value) return undefined;
    if (typeof value === 'object') return value;

    const trimmed = value.trim();
    if (!trimmed || (trimmed[0] !== '{' && trimmed[0] !== '[')) {
        return undefined;
    }

    try {
        return JSON.parse(trimmed) as AppliedDiscountSummary;
    } catch {
        return undefined;
    }
};

export const CART_FEATURE_KEY = 'cart';

export const initialCartState: CartState = {
    id: undefined,
    header: undefined,
    items: [],
    footer: {
        baseSubtotal: 0,
        discount: 0,
        lineDiscountTotal: 0,
        orderDiscountTotal: 0,
        subtotal: 0,
        tax: 0,
        savingsTotal: 0,
        total: 0,
        pricingSource: 'OFFLINE_LOCAL',
        reconciliationStatus: 'PENDING',
    },
    pricingContext: undefined,
    definitions: [],
    manualDiscounts: [],
    priceOverrides: [],
    promoCodes: [],
    approvalEvents: [],
    selected: undefined,
    activeProduct: undefined,
    customer: undefined,
};

export const cartSlice = createSlice({
    name: CART_FEATURE_KEY,
    initialState: initialCartState,
    reducers: {
        set: (state: CartState, action: PayloadAction<OrderEntityLike>) => {
            const o = action.payload;

            if (!o.lines) return;
            
            state.id = action.payload.id;
            state.orderNo = action.payload.orderNo;
            state.footer = {
                baseSubtotal: o.baseSubtotal ?? o.subtotal,
                discount: o.discountTotal ?? 0,
                lineDiscountTotal: o.lineDiscountTotal ?? 0,
                orderDiscountTotal: o.orderDiscountTotal ?? 0,
                subtotal: o.subtotal,
                tax: o.tax,
                savingsTotal: o.savingsTotal ?? o.discountTotal ?? 0,
                total: o.total,
                pricingSource: o.pricingSource ?? 'OFFLINE_LOCAL',
                reconciliationStatus: o.reconciliationStatus ?? 'PENDING',
            };
            state.header = {
                orderDate: o.orderDate!,
                orderNumber: o.id,
                status: o.status,
                employeeId: o.employeeId,
                employeeName: o.employeeName,
            }
            state.items = o.lines.map(i => ({
                quantity: i?.quantity,
                identifier: i?.identifier,
                product: {
                    id: i.productId,
                    name: i?.productName,
                    price: i?.basePrice ?? i?.price,
                    unitOfMeasure: i?.unitOfMeasure,
                    categoryId: i?.categoryId,
                    isEBTEligible: i?.isEBTEligible ?? false,
                    discountable: i?.discountable ?? true,
                    minAllowedPrice: i?.minAllowedPrice,
                    maxManualDiscountPercent: i?.maxManualDiscountPercent,
                    maxManualDiscountAmount: i?.maxManualDiscountAmount,
                }
            }));
            state.manualDiscounts = [];
            state.priceOverrides = [];
            state.promoCodes = (o.promoCodes || [])
                .filter((code): code is string => !!code)
                .map((code) => ({ code }));
            state.appliedDiscountSummary = parseAppliedDiscountSummary(
                o.appliedDiscountSummary
            );
            const restoredDiscountState = restoreDiscountStateFromSummary(
                state.appliedDiscountSummary
            );
            state.manualDiscounts = restoredDiscountState.manualDiscounts;
            state.priceOverrides = restoredDiscountState.priceOverrides;
            state.approvalEvents = state.appliedDiscountSummary?.approvalEvents || [];
            state.payments = [];
            state.customer = o.customer || undefined;
            state.selected = initialCartState.selected;
            state.activeProduct = initialCartState.activeProduct;
        },
        select: (state: CartState, action: PayloadAction<CartItem | undefined>) => {
            state.selected = action.payload;
        },
        setActiveProduct: (state: CartState, action: PayloadAction<CartItem | undefined>) => {
            state.activeProduct = action.payload;
        },
        selectCustomer: (state: CartState, action: PayloadAction<CartCustomer | undefined>) => {
            state.customer = action.payload;
        },
        upsert: (state: CartState, action: PayloadAction<CartItem>) => {
            const normalizedUnitOfMeasure =
                action.payload.product.unitOfMeasure?.trim().toUpperCase() || '';
            const isEachUnit = normalizedUnitOfMeasure === 'EA';
            const sameCartItem = state.items.find(
                (i) =>
                    !!action.payload.identifier &&
                    i.identifier === action.payload.identifier
            );
            const addItem = (state: CartState, item: CartItem) => {
                state.items?.push({
                    identifier: uuid.v4().toString(),
                    product: item.product,
                    quantity: item.quantity
                });
            };

            if (sameCartItem) {
                sameCartItem.quantity = action.payload.quantity;
                updateTotals(state);
                return;
            }

            const sameProducts = state.items.filter(i => i.product.id === action.payload.product.id);

            if (!sameProducts.length) {
                addItem(state, action.payload);
            } else if (isEachUnit) {
                sameProducts[0].quantity += action.payload.quantity;
            } else if (action.payload.quantity === 0) {
                addItem(state, action.payload);
            } else {
                const itemInZero = sameProducts.find(p => p.quantity === 0);
    
                if (itemInZero) {
                    itemInZero.quantity = action.payload.quantity;
                } else {
                    addItem(state, action.payload);
                }
            }

            updateTotals(state);
        },
        applyManualDiscount: (
            state: CartState,
            action: PayloadAction<CartState['manualDiscounts'][number]>
        ) => {
            const request = action.payload;
            if (request.scope === 'ORDER') {
                state.manualDiscounts = [
                    ...state.manualDiscounts.filter((discount) => discount.scope !== 'ORDER'),
                    request,
                ];
            } else {
                state.manualDiscounts = [
                    ...state.manualDiscounts.filter(
                        (discount) => !(discount.scope === 'LINE' && discount.lineId === request.lineId)
                    ),
                    request,
                ];
            }

            updateTotals(state);
        },
        applyPriceOverride: (
            state: CartState,
            action: PayloadAction<CartState['priceOverrides'][number]>
        ) => {
            const request = action.payload;
            state.priceOverrides = [
                ...state.priceOverrides.filter((override) => override.lineId !== request.lineId),
                request,
            ];
            state.manualDiscounts = state.manualDiscounts.filter(
                (discount) => !(discount.scope === 'LINE' && discount.lineId === request.lineId)
            );
            updateTotals(state);
        },
        addPromoCode: (state: CartState, action: PayloadAction<CartPromoCode>) => {
            const normalized = action.payload.code.trim().toUpperCase();
            if (!normalized) return;
            if (!state.promoCodes.some((promo) => promo.code.trim().toUpperCase() === normalized)) {
                state.promoCodes.push({ code: normalized });
            }
            updateTotals(state);
        },
        removePromoCode: (state: CartState, action: PayloadAction<string>) => {
            const normalized = action.payload.trim().toUpperCase();
            state.promoCodes = state.promoCodes.filter(
                (promo) => promo.code.trim().toUpperCase() !== normalized
            );
            updateTotals(state);
        },
        removePricingAdjustment: (
            state: CartState,
            action: PayloadAction<{ lineId?: string; scope?: 'LINE' | 'ORDER'; promoCode?: string }>
        ) => {
            const { lineId, scope, promoCode } = action.payload;

            if (promoCode) {
                state.promoCodes = state.promoCodes.filter(
                    (promo) => promo.code.trim().toUpperCase() !== promoCode.trim().toUpperCase()
                );
            }

            if (scope === 'ORDER') {
                state.manualDiscounts = state.manualDiscounts.filter(
                    (discount) => discount.scope !== 'ORDER'
                );
            }

            if (lineId) {
                state.manualDiscounts = state.manualDiscounts.filter(
                    (discount) => !(discount.scope === 'LINE' && discount.lineId === lineId)
                );
                state.priceOverrides = state.priceOverrides.filter(
                    (override) => override.lineId !== lineId
                );
            }

            updateTotals(state);
        },
        setPolicy: (
            state: CartState,
            action: PayloadAction<CartState['policy'] | undefined>
        ) => {
            state.policy = action.payload;
            updateTotals(state);
        },
        setDefinitions: (
            state: CartState,
            action: PayloadAction<CartState['definitions']>
        ) => {
            state.definitions = action.payload;
            updateTotals(state);
        },
        setPricingContext: (
            state: CartState,
            action: PayloadAction<CartState['pricingContext']>
        ) => {
            state.pricingContext = action.payload;
            updateTotals(state);
        },
        addApprovalEvent: (
            state: CartState,
            action: PayloadAction<CartState['approvalEvents'][number]>
        ) => {
            state.approvalEvents.push(action.payload);
            updateTotals(state);
        },
        removeProduct: (state: CartState, action: PayloadAction<CartItem>) => {
            state.items.splice(state.items.findIndex(i => i.identifier === action.payload.identifier), 1);
            state.manualDiscounts = state.manualDiscounts.filter(
                (discount) => !(discount.scope === 'LINE' && discount.lineId === action.payload.identifier)
            );
            state.priceOverrides = state.priceOverrides.filter(
                (override) => override.lineId !== action.payload.identifier
            );
            updateTotals(state);
        },
        addPayment: (state: CartState, action: PayloadAction<CartPayment[]>) => {
            state.footer.payments = action.payload;
        },
        restoreSnapshot: (state: CartState, action: PayloadAction<CartState>) => {
            Object.assign(state, action.payload);
        },
        reset: (state: CartState) => {
            state.id = undefined;
            state.orderNo = undefined;
            state.header = undefined;
            state.items = [];
            state.footer = {
                baseSubtotal: 0,
                discount: 0,
                lineDiscountTotal: 0,
                orderDiscountTotal: 0,
                subtotal: 0,
                tax: 0,
                savingsTotal: 0,
                total: 0,
                pricingSource: 'OFFLINE_LOCAL',
                reconciliationStatus: 'PENDING',
            };
            state.definitions = state.definitions || [];
            state.manualDiscounts = [];
            state.priceOverrides = [];
            state.promoCodes = [];
            state.approvalEvents = [];
            state.appliedDiscountSummary = undefined;
            state.selected = undefined;
            state.activeProduct = undefined;
            state.payments = [];
            state.customer = undefined;
        },
    },
});

export const cartReducer = cartSlice.reducer;
export const cartActions = cartSlice.actions;
export const getCartState = (rootState: RootState): CartState =>
    rootState[CART_FEATURE_KEY];

export const selectActiveProduct = createSelector(
    getCartState,
    (state: CartState) => state.activeProduct
);

export const selectCart = getCartState;


const updateTotals = (state: CartState) => {
    const preview = PricingEngine.preview({
        timezone: state.pricingContext?.timezone,
        storeId: state.pricingContext?.storeId,
        stationId: state.pricingContext?.stationId,
        employee: {
            employeeId: state.header?.employeeId || 'system',
            employeeName: state.header?.employeeName || 'System',
        },
        policy: state.policy,
        definitions: state.definitions,
        lines: state.items.map((item, index) => ({
            lineId: item.identifier || `line-${index}`,
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            baseUnitPrice: item.product.price,
            unitOfMeasure: item.product.unitOfMeasure,
            categoryId: item.product.categoryId,
            discountable: item.product.discountable ?? true,
            minAllowedPrice: item.product.minAllowedPrice,
            maxManualDiscountPercent: item.product.maxManualDiscountPercent,
            maxManualDiscountAmount: item.product.maxManualDiscountAmount,
        })),
        manualDiscounts: state.manualDiscounts,
        priceOverrides: state.priceOverrides,
        promoCodes: state.promoCodes,
        approvalEvents: state.approvalEvents,
        pricingSource: 'OFFLINE_LOCAL',
    });

    state.footer.baseSubtotal = preview.order.baseSubtotal;
    state.footer.subtotal = preview.order.subtotal;
    state.footer.tax = preview.order.tax;
    state.footer.discount = preview.order.discountTotal;
    state.footer.lineDiscountTotal = preview.order.lineDiscountTotal;
    state.footer.orderDiscountTotal = preview.order.orderDiscountTotal;
    state.footer.savingsTotal = preview.order.savingsTotal;
    state.footer.total = preview.order.total;
    state.footer.pricingSource = preview.order.pricingSource;
    state.footer.reconciliationStatus = preview.order.reconciliationStatus;
    state.appliedDiscountSummary = preview.summary;
}
