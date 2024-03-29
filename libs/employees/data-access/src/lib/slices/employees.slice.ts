
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { RootState } from '@pos/store';
import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    EntityId,
    EntityState,
    PayloadAction,
    Update,
} from '@reduxjs/toolkit';
import { EmployeeEntity, EmployeeEntityMapper } from '../employee.entity';
import { EmployeeService } from '../employee.service';

export const EMPLOYEE_FEATURE_KEY = 'employees';

export interface EmployeesState extends EntityState< EmployeeEntity > {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error?: string;
  selected?: EmployeeEntity;
  filterQuery?: string;
  filteredList?: EmployeeEntity[];
  loginEmployee?: EmployeeEntity;
}

export const employeesAdapter = createEntityAdapter< EmployeeEntity >();

export const fetchEmployees = createAsyncThunk(
  'employees/fetchStatus',
  async (_, thunkAPI) => {
    const employees = await EmployeeService.getAll();
    return employees.map(x => EmployeeEntityMapper.fromModel(x));
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
        employeesAdapter.addOne(state, action);
        filterList(state, state.filterQuery);
    },
    remove: (state: EmployeesState, action: PayloadAction< EntityId >) => {
        employeesAdapter.removeOne(state, action);
        filterList(state, state.filterQuery);
    },
    update: (state: EmployeesState, action: PayloadAction<Update< EmployeeEntity>>) => {
        employeesAdapter.updateOne(state, action);

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
        state.loginEmployee = state.entities[action.payload.id!]; //  action.payload;
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
        state.error = action.error.message;
      });
  },
});

/*
 * Export reducer for store configuration.
 */
export const employeesReducer = employeesSlice.reducer;

export const employeesActions = employeesSlice.actions;
const { selectAll, selectEntities } = employeesAdapter.getSelectors();

export const getEmployeesState = (rootState: RootState): EmployeesState =>
  rootState[EMPLOYEE_FEATURE_KEY];

export const selectAllEmployees = createSelector(
  getEmployeesState,
  selectAll
);

export const selectEmployeesEntities = createSelector(
  getEmployeesState,
  selectEntities
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
    const all = selectAll(state);
    
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

