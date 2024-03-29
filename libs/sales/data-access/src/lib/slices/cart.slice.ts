// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { RootState } from '@pos/store';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { EACH } from '@pos/unit-of-measures/data-access';
import {
    createAsyncThunk,
    createSelector,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import { CartItem, CartPayment, CartState } from '../cart-entity';
import uuid from 'react-native-uuid';
import { OrderEntity } from '@pos/orders/data-access';

export const CART_FEATURE_KEY = 'cart';

export const initialCartState: CartState = {
    id: undefined,
    header: undefined,
    items: [],
    footer: {
        discount: 0,
        subtotal: 0,
        tax: 0,
        total: 0
    },
    selected: undefined,
};

export const cartSlice = createSlice({
    name: CART_FEATURE_KEY,
    initialState: initialCartState,
    reducers: {
        set: (state: CartState, action: PayloadAction<OrderEntity>) => {
            const o = action.payload;

            if (!o.lines) return;
            
            state.id = action.payload.id;
            state.orderNo = action.payload.orderNo;
            state.footer = {
                discount: 0,
                subtotal: o.subtotal,
                tax: o.tax,
                total: o.total
            }
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
                    price: i?.price,
                    unitOfMeasure: i?.unitOfMeasure
                }
            }))
            state.payments = [];
            state.selected = initialCartState.selected;
        },
        select: (state: CartState, action: PayloadAction<CartItem | undefined>) => {
            state.selected = action.payload;
        },
        upsert: (state: CartState, action: PayloadAction<CartItem>) => {
            const sameCartItem = state.items.find(i => action.payload.identifier && i.identifier === action.payload.identifier);
            const addItem = (state: CartState, item: CartItem) => {
                state.items?.push({
                    identifier: uuid.v4().toString(),
                    product: action.payload.product,
                    quantity: action.payload.quantity
                });
            }

            if (sameCartItem) {
                sameCartItem.quantity = action.payload.quantity;
                updateTotals(state);
                return;
            }

            const sameProducts = state.items.filter(i => i.product.id === action.payload.product.id);

            if (!sameProducts.length) {
                addItem(state, action.payload);
            } else if (action.payload.product.unitOfMeasure === EACH) {
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
        removeProduct: (state: CartState, action: PayloadAction<CartItem>) => {
            state.items.splice(state.items.findIndex(i => i.identifier === action.payload.identifier), 1);
            updateTotals(state);
        },
        addPayment: (state: CartState, action: PayloadAction<CartPayment[]>) => {
            state.footer.payments = action.payload;
        },
        reset: (state: CartState) => {
            state.id = undefined;
            state.orderNo = undefined;
            state.header = undefined;
            state.items = [];
            state.footer = {
                discount: 0,
                subtotal: 0,
                tax: 0,
                total: 0
            };
            state.selected = undefined;
            state.payments = [];
        },
    },
});

export const cartReducer = cartSlice.reducer;
export const cartActions = cartSlice.actions;
export const getCartState = (rootState: RootState): CartState =>
    rootState[CART_FEATURE_KEY];

export const selectActiveProduct = createSelector(
    getCartState,
    (state: CartState) => state.selected
);

export const selectCart = createSelector(
    getCartState,
    (state) => state
)


const updateTotals = (state: CartState) => {
    const subtotal = state.items.reduce((prev, next) => {
        return prev + (next.product.price * next.quantity);
    }, 0);

    state.footer.subtotal = subtotal;
    state.footer.total = subtotal;
}