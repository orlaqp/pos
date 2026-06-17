// eslint-disable-next-line @nx/enforce-module-boundaries
import type { RootState } from '@pos/store';
import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    EntityState,
    PayloadAction,
} from '@reduxjs/toolkit';
import { CreditTransactionEntity, CustomerEntity } from '../customer.entity';
import { CustomerService } from '../customer.service';

export const CUSTOMERS_FEATURE_KEY = 'customers';

export interface CustomersState extends EntityState<CustomerEntity, string> {
    loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
    error?: string;
    selected?: CustomerEntity;
    ledger: CreditTransactionEntity[];
    filterQuery?: string;
    filteredList?: CustomerEntity[];
}

export const customersAdapter = createEntityAdapter<CustomerEntity, string>({
    selectId: (customer) => customer.id ?? '',
});

export const initialCustomersState: CustomersState =
    customersAdapter.getInitialState({
        loadingStatus: 'not loaded',
        selected: undefined,
        ledger: [],
        filterQuery: undefined,
        filteredList: undefined,
    });

export const fetchCustomers = createAsyncThunk(
    'customers/fetchStatus',
    async (_, thunkAPI) => {
        try {
            return await CustomerService.getAll();
        } catch (error) {
            const message =
                error instanceof Error
                    ? `${error.name}: ${error.message}`
                    : typeof error === 'string'
                    ? error
                    : JSON.stringify(error);

            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const customersSlice = createSlice({
    name: CUSTOMERS_FEATURE_KEY,
    initialState: initialCustomersState,
    reducers: {
        setAll: (state: CustomersState, action: PayloadAction<CustomerEntity[]>) => {
            customersAdapter.setAll(state, action.payload);
            state.loadingStatus = 'loaded';
            filterList(state, state.filterQuery);
        },
        upsert: (state: CustomersState, action: PayloadAction<CustomerEntity>) => {
            customersAdapter.upsertOne(state, action.payload);
            filterList(state, state.filterQuery);
        },
        remove: (state: CustomersState, action: PayloadAction<string>) => {
            customersAdapter.removeOne(state, action.payload);
            filterList(state, state.filterQuery);
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
        addLedgerTransaction: (
            state: CustomersState,
            action: PayloadAction<CreditTransactionEntity>
        ) => {
            state.ledger = [action.payload, ...state.ledger];
        },
        clearLedger: (state: CustomersState) => {
            state.ledger = [];
        },
        filter: (state: CustomersState, action: PayloadAction<string>) => {
            state.filterQuery = action.payload;
            filterList(state, action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCustomers.pending, (state: CustomersState) => {
                state.loadingStatus = 'loading';
            })
            .addCase(
                fetchCustomers.fulfilled,
                (state: CustomersState, action: PayloadAction<CustomerEntity[]>) => {
                    customersAdapter.setAll(state, action.payload);
                    state.loadingStatus = 'loaded';
                    filterList(state, state.filterQuery);
                }
            )
            .addCase(fetchCustomers.rejected, (state: CustomersState, action) => {
                state.loadingStatus = 'error';
                state.error =
                    typeof action.payload === 'string'
                        ? action.payload
                        : action.error?.message || 'Failed to load customers';
            });
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

export const selectLoadingStatus = createSelector(
    getCustomersState,
    (state: CustomersState) => state.loadingStatus
);

export const selectIsEmpty = createSelector(
    getCustomersState,
    (state: CustomersState) => state.ids.length === 0
);

export const selectFilteredList = createSelector(
    getCustomersState,
    (state: CustomersState) => state.filteredList
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

function filterList(state: CustomersState, query?: string) {
    state.loadingStatus = 'loaded';
    const all = customersAdapter.getSelectors().selectAll(state);

    if (!query) {
        state.filteredList = all;
        return;
    }

    const normalizedQuery = query.trim().toLowerCase();
    state.filteredList = all.filter((customer) =>
        [
            customer.displayName,
            customer.firstName,
            customer.middleName,
            customer.lastName,
            customer.phone,
            customer.email,
        ]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(normalizedQuery))
    );
}
