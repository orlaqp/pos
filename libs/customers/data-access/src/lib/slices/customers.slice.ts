// eslint-disable-next-line @nx/enforce-module-boundaries
import type { RootState } from '@pos/store';
import {
    createEntityAdapter,
    createSelector,
    createSlice,
    EntityState,
    PayloadAction,
} from '@reduxjs/toolkit';
import { CustomerEntity } from '../customer.entity';

export const CUSTOMERS_FEATURE_KEY = 'customers';

export interface CustomersState extends EntityState<CustomerEntity, string> {
    loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
    error?: string;
    selected?: CustomerEntity;
}

export const customersAdapter = createEntityAdapter<CustomerEntity, string>({
    selectId: (customer) => customer.id ?? '',
});

export const initialCustomersState: CustomersState =
    customersAdapter.getInitialState({
        loadingStatus: 'not loaded',
        selected: undefined,
    });

export const customersSlice = createSlice({
    name: CUSTOMERS_FEATURE_KEY,
    initialState: initialCustomersState,
    reducers: {
        setAll: (state: CustomersState, action: PayloadAction<CustomerEntity[]>) => {
            customersAdapter.setAll(state, action.payload);
            state.loadingStatus = 'loaded';
        },
        upsert: (state: CustomersState, action: PayloadAction<CustomerEntity>) => {
            customersAdapter.upsertOne(state, action.payload);
        },
        remove: (state: CustomersState, action: PayloadAction<string>) => {
            customersAdapter.removeOne(state, action.payload);
        },
        select: (state: CustomersState, action: PayloadAction<CustomerEntity | undefined>) => {
            state.selected = action.payload;
        },
        clearSelection: (state: CustomersState) => {
            state.selected = undefined;
        },
    },
});

export const customersReducer = customersSlice.reducer;
export const customersActions = customersSlice.actions;

export const getCustomersState = (rootState: RootState): CustomersState =>
    rootState[CUSTOMERS_FEATURE_KEY];

const customersSelectors =
    customersAdapter.getSelectors<RootState>(getCustomersState);

export const selectAllCustomers = createSelector(
    getCustomersState,
    (state) =>
        customersSelectors.selectAll({
            [CUSTOMERS_FEATURE_KEY]: state,
        } as RootState)
);

export const selectCustomersEntities = createSelector(
    getCustomersState,
    (state) =>
        customersSelectors.selectEntities({
            [CUSTOMERS_FEATURE_KEY]: state,
        } as RootState)
);

export const selectSelectedCustomer = createSelector(
    getCustomersState,
    (state: CustomersState) => state.selected
);
