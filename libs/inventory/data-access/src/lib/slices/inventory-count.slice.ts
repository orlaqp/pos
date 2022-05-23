
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
import { InventoryCountEntity } from '../inventory-count.entity';
import { InventoryCountService } from '../inventory-count.service';

export const INVENTORY_COUNT_FEATURE_KEY = 'inventoryCount';

export interface InventoryCountState extends EntityState< InventoryCountEntity > {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error?: string;
  selected?: InventoryCountEntity;
  filterQuery?: string;
  filteredList?: Dictionary< InventoryCountEntity >;
}

export const inventoryCountAdapter = createEntityAdapter< InventoryCountEntity >();

export const fetchInventoryCount = createAsyncThunk(
  'inventoryCount/fetchStatus',
  async (_, thunkAPI) => {
    const inventoryCount = await InventoryCountService.getAll();
    return inventoryCount.map(c => ({
        id: c.id,
        
        // TODO: Assign rest of properties here

        createdAt: c.createdAt,
        updatedAt: c.updatedAt
    }))
  }
);

export const initialInventoryCountState: InventoryCountState =
  inventoryCountAdapter.getInitialState({
    loadingStatus: 'not loaded',
    selected: undefined,
    filterQuery: undefined,
    filteredList: undefined
  });

export const inventoryCountSlice = createSlice({
  name: INVENTORYCount_FEATURE_KEY,
  initialState: initialInventoryCountState,
  reducers: {
    add: (state: InventoryCountState, action: PayloadAction< InventoryCountEntity >) =>{
        inventoryCountAdapter.addOne(state, action);
        filterList(state, state.filterQuery);
    },
    remove: (state: InventoryCountState, action: PayloadAction< EntityId >) => {
        inventoryCountAdapter.removeOne(state, action);
        filterList(state, state.filterQuery);
    },
    update: (state: InventoryCountState, action: PayloadAction<Update< InventoryCountEntity>>) => {
        inventoryCountAdapter.updateOne(state, action);
        filterList(state, state.filterQuery);
    },
    select: (state: InventoryCountState, action: PayloadAction< InventoryCountEntity >) => {
        state.selected = action.payload;
    },
    clearSelection: (state: InventoryCountState) => {
        state.selected = undefined;
    },
    filter: (state: InventoryCountState, action: PayloadAction<string>) => {
        filterList(state, action.payload);
        state.filterQuery = action.payload;
    }
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryCount.pending, (state: InventoryCountState) => {
        state.loadingStatus = 'loading';
      })
      .addCase(
        fetchInventoryCount.fulfilled,
        (state: InventoryCountState, action: PayloadAction< InventoryCountEntity[] >) => {
          inventoryCountAdapter.setAll(state, action.payload);
          filterList(state, state.filterQuery);
          state.loadingStatus = 'loaded';
        }
      )
      .addCase(fetchInventoryCount.rejected, (state: InventoryCountState, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message;
      });
  },
});

/*
 * Export reducer for store configuration.
 */
export const inventoryCountReducer = inventoryCountSlice.reducer;

export const inventoryCountActions = inventoryCountSlice.actions;
const { selectAll, selectEntities } = inventoryCountAdapter.getSelectors();

export const getInventoryCountState = (rootState: RootState): InventoryCountState =>
  rootState[INVENTORY_FEATURE_KEY];

export const selectAllInventoryCount = createSelector(
  getInventoryCountState,
  selectAll
);

export const selectInventoryCountEntities = createSelector(
  getInventoryCountState,
  selectEntities
);

export const selectLoadingStatus = createSelector(
    getInventoryCountState,
    (state: InventoryCountState) => state.loadingStatus
)

export const selectIsEmpty = createSelector(
    getInventoryCountState,
    (state: InventoryCountState) => state.ids.length === 0
)

export const selectFilteredList = createSelector(
    getInventoryCountState,
    (state: InventoryCountState) => state.filteredList
)




function filterList(state: InventoryCountState, query?: string) {
    const filteredList: Dictionary< InventoryCountEntity> = {};
    state.loadingStatus = 'loaded';
    
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

