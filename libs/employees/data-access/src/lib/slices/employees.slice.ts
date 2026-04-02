
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
export const EMPLOYEE_FEATURE_KEY = 'employees';

export interface EmployeesState extends EntityState<EmployeeEntity, string> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error?: string;
  selected?: EmployeeEntity;
  filterQuery?: string;
  filteredList?: EmployeeEntity[];
  loginEmployee?: EmployeeEntity;
  initialSyncComplete: boolean;
}

export const employeesAdapter = createEntityAdapter<EmployeeEntity, string>({
    selectId: (employee) => employee.id ?? '',
});

export const fetchEmployees = createAsyncThunk(
  'employees/fetchStatus',
  async (_, thunkAPI) => {
    try {
      const employees = await EmployeeService.getSyncedLocalEmployees();

      return {
        employees: employees.map(x => EmployeeEntityMapper.fromModel(x)),
        initialSyncComplete: true,
      };
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

export const initialEmployeesState: EmployeesState =
  employeesAdapter.getInitialState({
    loadingStatus: 'not loaded',
    selected: undefined,
    filterQuery: undefined,
    filteredList: undefined,
    loginEmployee: undefined,
    initialSyncComplete: false,
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
        if (action.payload.length > 0) {
            state.initialSyncComplete = true;
        }
        filterList(state, state.filterQuery);
    },
    markInitialSyncComplete: (
        state: EmployeesState,
        action: PayloadAction<boolean | undefined>
    ) => {
        state.initialSyncComplete = action.payload ?? true;
        if (state.loadingStatus === 'not loaded') {
            state.loadingStatus = 'loaded';
        }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state: EmployeesState) => {
        state.loadingStatus = 'loading';
      })
      .addCase(
        fetchEmployees.fulfilled,
        (state: EmployeesState, action: PayloadAction<{ employees: EmployeeEntity[]; initialSyncComplete: boolean }>) => {
          employeesAdapter.setAll(state, action.payload.employees);
          filterList(state, state.filterQuery);
          state.loadingStatus = 'loaded';
          state.initialSyncComplete = action.payload.initialSyncComplete;
        }
      )
      .addCase(fetchEmployees.rejected, (state: EmployeesState, action) => {
        state.loadingStatus = 'error';
        state.initialSyncComplete = false;
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

export const selectInitialEmployeeSyncComplete = createSelector(
    getEmployeesState,
    (state: EmployeesState) => state.initialSyncComplete
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
