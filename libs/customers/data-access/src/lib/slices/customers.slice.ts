// eslint-disable-next-line @nx/enforce-module-boundaries
import type { RootState } from '@pos/store';
import {
    createEntityAdapter,
    createSelector,
    createSlice,
    EntityState,
    PayloadAction,
} from '@reduxjs/toolkit';
import { CreditTransactionEntity, CustomerEntity } from '../customer.entity';

export const CUSTOMERS_FEATURE_KEY = 'customers';

export interface CustomersState extends EntityState<CustomerEntity, string> {
    loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
    error?: string;
    selected?: CustomerEntity;
    ledger: CreditTransactionEntity[];
}

export const customersAdapter = createEntityAdapter<CustomerEntity, string>({
    selectId: (customer) => customer.id ?? '',
});

export const initialCustomersState: CustomersState =
    customersAdapter.getInitialState({
        loadingStatus: 'not loaded',
        selected: undefined,
        ledger: [],
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
        setLedger: (
            state: CustomersState,
            action: PayloadAction<CreditTransactionEntity[]>
        ) => {
            state.ledger = action.payload;
        },
        clearLedger: (state: CustomersState) => {
            state.ledger = [];
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

export const selectCustomerLedger = createSelector(
    getCustomersState,
    (state: CustomersState) => state.ledger
);

export const selectCustomerSearchResults = (rootState: RootState, query: string) => {
    const normalizedQuery = query.trim().toLowerCase();
    const customers = selectAllCustomers(rootState);

    if (!normalizedQuery) {
        return customers;
    }

    return customers.filter((customer) =>
        [
            customer.displayName,
            customer.firstName,
            customer.middleName,
            customer.lastName,
            customer.phone,
            customer.email?.trim().toLowerCase(),
        ]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(normalizedQuery))
    );
};
