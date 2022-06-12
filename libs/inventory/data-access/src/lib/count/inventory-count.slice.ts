
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
import { InventoryCountLineDTO } from './inventory-count-line.entity';
import { InventoryCountDTO, InventoryCountMapper } from './inventory-count.entity';
import { InventoryCountService } from './inventory-count.service';

export const INVENTORY_COUNT_FEATURE_KEY = 'inventoryCount';

export interface InventoryCountState extends EntityState< InventoryCountDTO > {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error?: string;
  selected?: InventoryCountDTO;
  filterQuery?: string;
  filteredList?: InventoryCountDTO[];
  lines: InventoryCountLineDTO[];
}

export const inventoryCountAdapter = createEntityAdapter< InventoryCountDTO >();

export const fetchInventoryCount = createAsyncThunk(
  'inventoryCount/fetchStatus',
  async (_, thunkAPI) => {
    const inventoryCount = await InventoryCountService.getAll();
    return inventoryCount.map(i => InventoryCountMapper.fromModel(i, []));
  }
);

export const initialInventoryCountState: InventoryCountState =
  inventoryCountAdapter.getInitialState({
    loadingStatus: 'not loaded',
    selected: undefined,
    filterQuery: undefined,
    filteredList: undefined,
    lines: []
  });

export const inventoryCountSlice = createSlice({
  name: INVENTORY_COUNT_FEATURE_KEY,
  initialState: initialInventoryCountState,
  reducers: {
    setAll: (state: InventoryCountState, action: PayloadAction<InventoryCountDTO[]>) => {
        inventoryCountAdapter.setAll(
            state,
            InventoryCountMapper.composeInventoryItems(action.payload, state.lines)
        );
        filterList(state, state.filterQuery);
        state.loadingStatus = 'loaded';
    },
    setLines: (
        state: InventoryCountState,
        action: PayloadAction<InventoryCountLineDTO[]>
    ) => {
        state.lines = action.payload;
        inventoryCountAdapter.setAll(
            state,
            InventoryCountMapper.composeInventoryItems(
                inventoryCountAdapter.getSelectors().selectAll(state),
                state.lines
            )
        );
        filterList(state, state.filterQuery);
        state.loadingStatus = 'loaded';
    },
    add: (state: InventoryCountState, action: PayloadAction< InventoryCountDTO >) =>{
        inventoryCountAdapter.addOne(state, action);
        filterList(state, state.filterQuery);
    },
    remove: (state: InventoryCountState, action: PayloadAction< EntityId >) => {
        inventoryCountAdapter.removeOne(state, action);
        filterList(state, state.filterQuery);
    },
    update: (state: InventoryCountState, action: PayloadAction<Update< InventoryCountDTO>>) => {
        inventoryCountAdapter.updateOne(state, action);
        filterList(state, state.filterQuery);
    },
    select: (state: InventoryCountState, action: PayloadAction< InventoryCountDTO >) => {
        state.selected = action.payload;
    },
    clearSelection: (state: InventoryCountState) => {
        state.selected = undefined;
    },
    filter: (state: InventoryCountState, action: PayloadAction<string>) => {
        filterList(state, action.payload);
        state.filterQuery = action.payload;
    },
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryCount.pending, (state: InventoryCountState) => {
        state.loadingStatus = 'loading';
      })
      .addCase(
        fetchInventoryCount.fulfilled,
        (state: InventoryCountState, action: PayloadAction< InventoryCountDTO[] >) => {
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
  rootState[INVENTORY_COUNT_FEATURE_KEY];

export const selectAllInventoryCount = createSelector(
  getInventoryCountState,
  selectAll
);

export const selectInventoryCountEntities = createSelector(
  getInventoryCountState,
  selectEntities
);

export const selectInventoryCountLoadingStatus = createSelector(
    getInventoryCountState,
    (state: InventoryCountState) => state.loadingStatus
)

export const selectInventoryCountIsEmpty = createSelector(
    getInventoryCountState,
    (state: InventoryCountState) => state.ids.length === 0
)

export const selectInventoryCountFilteredList = createSelector(
    getInventoryCountState,
    (state: InventoryCountState) => state.filteredList
)


function filterList(state: InventoryCountState, query?: string) {
    state.loadingStatus = 'loaded';
    const all = selectAll(state);
    
    if (!query) {
        state.filteredList = all;
        return;
    }

    const lowerQuery = query.toLowerCase();
    state.filteredList = all.filter(x => x.comments?.toLowerCase().indexOf(lowerQuery) !== -1);
}

