
// eslint-disable-next-line @nx/enforce-module-boundaries
import { RootState } from '@pos/store';
import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    EntityState,
    PayloadAction,
    Update,
} from '@reduxjs/toolkit';
import { EmployeeEntity, EmployeeEntityMapper } from '../employee.entity';
import { EmployeeService } from '../employee.service';
import { DataStore } from '@pos/shared/amplify';

export const EMPLOYEE_FEATURE_KEY = 'employees';

export interface EmployeesState extends EntityState<EmployeeEntity, string> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error?: string;
  selected?: EmployeeEntity;
  filterQuery?: string;
  filteredList?: EmployeeEntity[];
  loginEmployee?: EmployeeEntity;
}

export const employeesAdapter = createEntityAdapter<EmployeeEntity, string>({
    selectId: (employee) => employee.id ?? '',
});

export const fetchEmployees = createAsyncThunk(
  'employees/fetchStatus',
  async (_, thunkAPI) => {
    const withTimeout = async <T>(label: string, promise: Promise<T>, ms = 10000) => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
        ),
      ]);
    };

    try {
      const employees = await EmployeeService.getAll();
      return employees.map(x => EmployeeEntityMapper.fromModel(x));
    } catch (error) {
      console.warn('Initial employee query failed, resetting DataStore and retrying once');

      try {
        console.log('fetchEmployees recovery: clear');
        await withTimeout('DataStore.clear()', DataStore.clear() as Promise<void>);
        console.log('fetchEmployees recovery: restart query');

        const employees = (await withTimeout(
          'EmployeeService.getAll() retry',
          EmployeeService.getAll()
        )) as Awaited<ReturnType<typeof EmployeeService.getAll>>;
        console.log('fetchEmployees recovery: success', employees.length);
        return employees.map(x => EmployeeEntityMapper.fromModel(x));
      } catch (retryError) {
        const message =
          retryError instanceof Error
            ? `${retryError.name}: ${retryError.message}`
            : typeof retryError === 'string'
              ? retryError
              : JSON.stringify(retryError);

        console.error('fetchEmployees failed', retryError);
        if (retryError instanceof Error && retryError.stack) {
          console.error('fetchEmployees stack', retryError.stack);
        }
        return thunkAPI.rejectWithValue(message);
      }
    }
  }
);

export const initialEmployeesState: EmployeesState =
  employeesAdapter.getInitialState({
    loadingStatus: 'not loaded',
    selected: undefined,
    filterQuery: undefined,
    filteredList: undefined,
    loginEmployee: undefined,
  });

export const employeesSlice = createSlice({
  name: EMPLOYEE_FEATURE_KEY,
  initialState: initialEmployeesState,
  reducers: {
    add: (state: EmployeesState, action: PayloadAction< EmployeeEntity >) =>{
        employeesAdapter.addOne(state, action.payload);
        filterList(state, state.filterQuery);
    },
    remove: (state: EmployeesState, action: PayloadAction<string>) => {
        employeesAdapter.removeOne(state, action.payload);
        filterList(state, state.filterQuery);
    },
    update: (state: EmployeesState, action: PayloadAction<Update<EmployeeEntity, string>>) => {
        employeesAdapter.updateOne(state, action.payload);

        filterList(state, state.filterQuery);

        if (state.loginEmployee?.id === action.payload.id) {
            state.loginEmployee = state.entities[action.payload.id!];
        }
    },
    select: (state: EmployeesState, action: PayloadAction< EmployeeEntity >) => {
        state.selected = action.payload;
    },
    clearSelection: (state: EmployeesState) => {
        state.selected = undefined;
    },
    filter: (state: EmployeesState, action: PayloadAction<string>) => {
        filterList(state, action.payload);
        state.filterQuery = action.payload;
    },
    loginEmployee: (state: EmployeesState, action: PayloadAction<EmployeeEntity>) => {
        state.loginEmployee = state.entities[action.payload.id!] ?? action.payload;
    },
    logoffEmployee: (state: EmployeesState) => {
        state.loginEmployee = undefined;
    },
    setAll: (state: EmployeesState, action: PayloadAction<EmployeeEntity[] >) =>{
        employeesAdapter.setAll(state, action.payload);
        state.loadingStatus = 'loaded';
        filterList(state, state.filterQuery);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state: EmployeesState) => {
        state.loadingStatus = 'loading';
      })
      .addCase(
        fetchEmployees.fulfilled,
        (state: EmployeesState, action: PayloadAction<EmployeeEntity[] >) => {
          employeesAdapter.setAll(state, action.payload);
          filterList(state, state.filterQuery);
          state.loadingStatus = 'loaded';
        }
      )
      .addCase(fetchEmployees.rejected, (state: EmployeesState, action) => {
        state.loadingStatus = 'error';
        state.error =
            typeof action.payload === 'string'
                ? action.payload
                : action.error?.message || 'Failed to load employees';
      });
  },
});

/*
 * Export reducer for store configuration.
 */
export const employeesReducer = employeesSlice.reducer;

export const employeesActions = employeesSlice.actions;
export const getEmployeesState = (rootState: RootState): EmployeesState =>
  rootState[EMPLOYEE_FEATURE_KEY];

const employeeSelectors = employeesAdapter.getSelectors<RootState>(getEmployeesState);

export const selectAllEmployees = createSelector(
  getEmployeesState,
  (state) =>
      employeeSelectors.selectAll({ [EMPLOYEE_FEATURE_KEY]: state } as RootState)
);

export const selectEmployeesEntities = createSelector(
  getEmployeesState,
  (state) =>
      employeeSelectors.selectEntities({ [EMPLOYEE_FEATURE_KEY]: state } as RootState)
);

export const selectLoadingStatus = createSelector(
    getEmployeesState,
    (state: EmployeesState) => state.loadingStatus
)

export const selectIsEmpty = createSelector(
    getEmployeesState,
    (state: EmployeesState) => state.ids.length === 0
)

export const selectFilteredList = createSelector(
    getEmployeesState,
    (state: EmployeesState) => state.filteredList
)

export const selectLoginEmployee = createSelector(
    getEmployeesState,
    (state: EmployeesState) => state.loginEmployee
)




function filterList(state: EmployeesState, query?: string) {
    state.loadingStatus = 'loaded';
    const all = employeesAdapter.getSelectors().selectAll(state);
    
    if (!query) {
        state.filteredList = all;
        return;
    }

    const lowerQuery = query.toLowerCase();
    state.filteredList = all.filter(x => 
      x.firstName?.toLowerCase().indexOf(lowerQuery) !== -1
      || x.lastName?.toLowerCase().indexOf(lowerQuery) !== -1
      || x.email?.toLowerCase().indexOf(lowerQuery) !== -1
      || x.phone?.toLowerCase().indexOf(lowerQuery) !== -1
    );
}
