// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { RootState } from '@pos/store';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { ProductEntity } from '@pos/products/data-access';
import {
    createSelector,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import { CartState } from '../../cart-entity';

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
        select: (state: CartState, action: PayloadAction<ProductEntity | undefined>) => {
            state.selected = action.payload;
        },
        addProduct: (state: CartState, action: PayloadAction<{ product: ProductEntity, quantity: number }>) => {
            state.items?.push({ product: action.payload.product, quantity: action.payload.quantity });
            updateTotals(state);
        },
        removeProduct: (state: CartState, action: PayloadAction<ProductEntity>) => {
            state.items.splice(state.items.findIndex(i => i.product === action.payload), 1);
            updateTotals(state);
        }
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