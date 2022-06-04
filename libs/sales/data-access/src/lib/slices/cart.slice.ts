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
import { CartItem, CartState } from '../cart-entity';
import uuid from 'react-native-uuid';
import { OrderEntity } from '@pos/orders/data-access';

export const CART_FEATURE_KEY = 'cart';

export const initialCartState: CartState = {
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
                id: i?.identifier,
                product: {
                    id: i.productId,
                    name: i?.productName,
                    price: i?.price,
                    unitOfMeasure: i?.unitOfMeasure
                }
            }))
            state.selected = initialCartState.selected;
        },
        select: (state: CartState, action: PayloadAction<CartItem | undefined>) => {
            state.selected = action.payload;
        },
        upsert: (state: CartState, action: PayloadAction<CartItem>) => {
            const sameCartItem = state.items.find(i => action.payload.id && i.id === action.payload.id);
            const addItem = (state: CartState, item: CartItem) => {
                state.items?.push({
                    id: uuid.v4().toString(),
                    product: action.payload.product,
                    quantity: action.payload.quantity
                });
            }

            if (sameCartItem) {
                sameCartItem.quantity = action.payload.quantity;
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
            state.items.splice(state.items.findIndex(i => i === action.payload), 1);
            updateTotals(state);
        },
        reset: (state: CartState) => {
            state.footer = initialCartState.footer;
            state.header = initialCartState.header;
            state.items = initialCartState.items;
            state.selected = initialCartState.selected;
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