import { UnitOfMeasureEntityMapper } from './../unit-of-measure.entity';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { RootState } from '@pos/store';
import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    Dictionary,
    EntityId,
    EntityState,
    PayloadAction,
    Update,
} from '@reduxjs/toolkit';
import { UnitOfMeasureEntity } from '../unit-of-measure.entity';
import { UnitOfMeasureService } from '../unit-of-measure.service';

export const UNITOFMEASURE_FEATURE_KEY = 'unitOfMeasures';

export interface UnitOfMeasuresState extends EntityState< UnitOfMeasureEntity > {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error?: string;
  selected?: UnitOfMeasureEntity;
  filterQuery?: string;
  filteredList?: Dictionary< UnitOfMeasureEntity >;
}

export const unitOfMeasuresAdapter = createEntityAdapter< UnitOfMeasureEntity >();

export const fetchUnitOfMeasures = createAsyncThunk(
  'unitOfMeasures/fetchStatus',
  async (_, thunkAPI) => {
    const unitOfMeasures = await UnitOfMeasureService.getAll();
    return unitOfMeasures.map(u => UnitOfMeasureEntityMapper.fromModel(u));
  }
);

export const initialUnitOfMeasuresState: UnitOfMeasuresState =
  unitOfMeasuresAdapter.getInitialState({
    loadingStatus: 'not loaded',
    selected: undefined,
    filterQuery: undefined,
    filteredList: undefined
  });

export const unitOfMeasuresSlice = createSlice({
  name: UNITOFMEASURE_FEATURE_KEY,
  initialState: initialUnitOfMeasuresState,
  reducers: {
    setAll: (state: UnitOfMeasuresState, action: PayloadAction< UnitOfMeasureEntity[] >) =>{
        unitOfMeasuresAdapter.setAll(state, action.payload);
        state.loadingStatus = 'loaded';
        filterList(state, state.filterQuery);
    },
    add: (state: UnitOfMeasuresState, action: PayloadAction< UnitOfMeasureEntity >) => {
        unitOfMeasuresAdapter.addOne(state, action);
        filterList(state, state.filterQuery);
    },
    remove: (state: UnitOfMeasuresState, action: PayloadAction< EntityId >) => {
        unitOfMeasuresAdapter.removeOne(state, action);
        filterList(state, state.filterQuery);
    },
    update: (state: UnitOfMeasuresState, action: PayloadAction<Update<UnitOfMeasureEntity>>) => {
        unitOfMeasuresAdapter.updateOne(state, action);
        filterList(state, state.filterQuery);
    },
    select: (state: UnitOfMeasuresState, action: PayloadAction< UnitOfMeasureEntity >) => {
        state.selected = action.payload;
    },
    clearSelection: (state: UnitOfMeasuresState) => {
        state.selected = undefined;
    },
    filter: (state: UnitOfMeasuresState, action: PayloadAction<string>) => {
        filterList(state, action.payload);
        state.filterQuery = action.payload;
    }
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnitOfMeasures.pending, (state: UnitOfMeasuresState) => {
        state.loadingStatus = 'loading';
      })
      .addCase(
        fetchUnitOfMeasures.fulfilled,
        (state: UnitOfMeasuresState, action: PayloadAction< UnitOfMeasureEntity[] >) => {
          unitOfMeasuresAdapter.setAll(state, action.payload);
          filterList(state, state.filterQuery);
          state.loadingStatus = 'loaded';
        }
      )
      .addCase(fetchUnitOfMeasures.rejected, (state: UnitOfMeasuresState, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message;
      });
  },
});

/*
 * Export reducer for store configuration.
 */
export const unitOfMeasuresReducer = unitOfMeasuresSlice.reducer;
export const unitOfMeasuresActions = unitOfMeasuresSlice.actions;

const { selectAll, selectEntities } = unitOfMeasuresAdapter.getSelectors();

export const getUnitOfMeasuresState = (rootState: RootState): UnitOfMeasuresState =>
  rootState[UNITOFMEASURE_FEATURE_KEY];

export const selectAllUnitOfMeasures = createSelector(
  getUnitOfMeasuresState,
  selectAll
);

export const selectUnitOfMeasuresEntities = createSelector(
  getUnitOfMeasuresState,
  selectEntities
);

export const selectLoadingStatus = createSelector(
    getUnitOfMeasuresState,
    (state: UnitOfMeasuresState) => state.loadingStatus
)

export const selectIsEmpty = createSelector(
    getUnitOfMeasuresState,
    (state: UnitOfMeasuresState) => state.ids.length === 0
)

export const selectFilteredList = createSelector(
    getUnitOfMeasuresState,
    (state: UnitOfMeasuresState) => state.filteredList
)

export const selectUnitOfMeasure = (id: string | null | undefined) => createSelector(
    getUnitOfMeasuresState,
    (state: UnitOfMeasuresState) => id ? state.entities[id] : null
)


function filterList(state: UnitOfMeasuresState, query?: string) {
    const filteredList: Dictionary<UnitOfMeasureEntity> = {};
    
    if (!query) {
        state.filteredList = state.entities;
        return;
    }

    const lowerQuery = query.toLowerCase();
    
    // const queryString = query || state.filterQuery;
    
    state.ids.forEach(id => {
        if (state.entities[id]?.name?.toLowerCase().indexOf(lowerQuery) === -1)
            return;

        filteredList[id] = state.entities[id];
    });

    state.filteredList = filteredList;
}

