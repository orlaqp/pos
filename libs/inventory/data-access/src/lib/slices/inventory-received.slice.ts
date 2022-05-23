
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
import { InventoryReceivedEntity } from '../inventory-count.entity';
import { InventoryReceivedService } from '../inventory-count.service';

export const INVENTORY_RECEIVED_FEATURE_KEY = 'inventoryReceived';

export interface InventoryReceivedState extends EntityState< InventoryReceivedEntity > {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error?: string;
  selected?: InventoryReceivedEntity;
  filterQuery?: string;
  filteredList?: Dictionary< InventoryReceivedEntity >;
}

export const inventoryReceivedAdapter = createEntityAdapter< InventoryReceivedEntity >();

export const fetchInventoryReceived = createAsyncThunk(
  'inventoryReceived/fetchStatus',
  async (_, thunkAPI) => {
    const inventoryReceived = await InventoryReceivedService.getAll();
    return inventoryReceived.map(c => ({
        id: c.id,
        
        // TODO: Assign rest of properties here

        createdAt: c.createdAt,
        updatedAt: c.updatedAt
    }))
  }
);

export const initialInventoryReceivedState: InventoryReceivedState =
  inventoryReceivedAdapter.getInitialState({
    loadingStatus: 'not loaded',
    selected: undefined,
    filterQuery: undefined,
    filteredList: undefined
  });

export const inventoryReceivedSlice = createSlice({
  name: INVENTORYReceived_FEATURE_KEY,
  initialState: initialInventoryReceivedState,
  reducers: {
    add: (state: InventoryReceivedState, action: PayloadAction< InventoryReceivedEntity >) =>{
        inventoryReceivedAdapter.addOne(state, action);
        filterList(state, state.filterQuery);
    },
    remove: (state: InventoryReceivedState, action: PayloadAction< EntityId >) => {
        inventoryReceivedAdapter.removeOne(state, action);
        filterList(state, state.filterQuery);
    },
    update: (state: InventoryReceivedState, action: PayloadAction<Update< InventoryReceivedEntity>>) => {
        inventoryReceivedAdapter.updateOne(state, action);
        filterList(state, state.filterQuery);
    },
    select: (state: InventoryReceivedState, action: PayloadAction< InventoryReceivedEntity >) => {
        state.selected = action.payload;
    },
    clearSelection: (state: InventoryReceivedState) => {
        state.selected = undefined;
    },
    filter: (state: InventoryReceivedState, action: PayloadAction<string>) => {
        filterList(state, action.payload);
        state.filterQuery = action.payload;
    }
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryReceived.pending, (state: InventoryReceivedState) => {
        state.loadingStatus = 'loading';
      })
      .addCase(
        fetchInventoryReceived.fulfilled,
        (state: InventoryReceivedState, action: PayloadAction< InventoryReceivedEntity[] >) => {
          inventoryReceivedAdapter.setAll(state, action.payload);
          filterList(state, state.filterQuery);
          state.loadingStatus = 'loaded';
        }
      )
      .addCase(fetchInventoryReceived.rejected, (state: InventoryReceivedState, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message;
      });
  },
});

/*
 * Export reducer for store configuration.
 */
export const inventoryReceivedReducer = inventoryReceivedSlice.reducer;

export const inventoryReceivedActions = inventoryReceivedSlice.actions;
const { selectAll, selectEntities } = inventoryReceivedAdapter.getSelectors();

export const getInventoryReceivedState = (rootState: RootState): InventoryReceivedState =>
  rootState[INVENTORY_FEATURE_KEY];

export const selectAllInventoryReceived = createSelector(
  getInventoryReceivedState,
  selectAll
);

export const selectInventoryReceivedEntities = createSelector(
  getInventoryReceivedState,
  selectEntities
);

export const selectLoadingStatus = createSelector(
    getInventoryReceivedState,
    (state: InventoryReceivedState) => state.loadingStatus
)

export const selectIsEmpty = createSelector(
    getInventoryReceivedState,
    (state: InventoryReceivedState) => state.ids.length === 0
)

export const selectFilteredList = createSelector(
    getInventoryReceivedState,
    (state: InventoryReceivedState) => state.filteredList
)




function filterList(state: InventoryReceivedState, query?: string) {
    const filteredList: Dictionary< InventoryReceivedEntity> = {};
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

