
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
import { InventoryReceiveLineDTO } from './inventory-receive-line.entity';
import { InventoryReceiveDTO, InventoryReceiveMapper } from './inventory-receive.entity';
import { InventoryReceiveService } from './inventory-receive.service';

export const INVENTORY_RECEIVE_FEATURE_KEY = 'inventoryReceive';

export interface InventoryReceiveState extends EntityState< InventoryReceiveDTO > {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error?: string;
  selected?: InventoryReceiveDTO;
  filterQuery?: string;
  filteredList?: Dictionary< InventoryReceiveDTO >;
  lines: InventoryReceiveLineDTO[];
}

export const inventoryReceiveAdapter = createEntityAdapter< InventoryReceiveDTO >();

export const fetchInventoryReceive = createAsyncThunk(
  'inventoryReceive/fetchStatus',
  async (_, thunkAPI) => {
    const inventoryReceive = await InventoryReceiveService.getAll();
    return inventoryReceive.map(i => InventoryReceiveMapper.fromModel(i, []));
  }
);

export const initialInventoryReceiveState: InventoryReceiveState =
  inventoryReceiveAdapter.getInitialState({
    loadingStatus: 'not loaded',
    selected: undefined,
    filterQuery: undefined,
    filteredList: undefined,
    lines: []
  });

export const inventoryReceiveSlice = createSlice({
  name: INVENTORY_RECEIVE_FEATURE_KEY,
  initialState: initialInventoryReceiveState,
  reducers: {
    setAll: (state: InventoryReceiveState, action: PayloadAction<InventoryReceiveDTO[]>) => {
        inventoryReceiveAdapter.setAll(
            state,
            InventoryReceiveMapper.composeReceiveItems(action.payload, state.lines)
        );
        filterList(state, state.filterQuery);
        state.loadingStatus = 'loaded';
    },
    setLines: (
        state: InventoryReceiveState,
        action: PayloadAction<InventoryReceiveLineDTO[]>
    ) => {
        state.lines = action.payload;
        inventoryReceiveAdapter.setAll(
            state,
            InventoryReceiveMapper.composeReceiveItems(
                inventoryReceiveAdapter.getSelectors().selectAll(state),
                state.lines
            )
        );
        filterList(state, state.filterQuery);
        state.loadingStatus = 'loaded';
    },
    add: (state: InventoryReceiveState, action: PayloadAction< InventoryReceiveDTO >) =>{
        inventoryReceiveAdapter.addOne(state, action);
        filterList(state, state.filterQuery);
    },
    remove: (state: InventoryReceiveState, action: PayloadAction< EntityId >) => {
        inventoryReceiveAdapter.removeOne(state, action);
        filterList(state, state.filterQuery);
    },
    update: (state: InventoryReceiveState, action: PayloadAction<Update< InventoryReceiveDTO>>) => {
        inventoryReceiveAdapter.updateOne(state, action);
        filterList(state, state.filterQuery);
    },
    select: (state: InventoryReceiveState, action: PayloadAction< InventoryReceiveDTO >) => {
        state.selected = action.payload;
    },
    clearSelection: (state: InventoryReceiveState) => {
        state.selected = undefined;
    },
    filter: (state: InventoryReceiveState, action: PayloadAction<string>) => {
        filterList(state, action.payload);
        state.filterQuery = action.payload;
    },
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryReceive.pending, (state: InventoryReceiveState) => {
        state.loadingStatus = 'loading';
      })
      .addCase(
        fetchInventoryReceive.fulfilled,
        (state: InventoryReceiveState, action: PayloadAction< InventoryReceiveDTO[] >) => {
          inventoryReceiveAdapter.setAll(state, action.payload);
          filterList(state, state.filterQuery);
          state.loadingStatus = 'loaded';
        }
      )
      .addCase(fetchInventoryReceive.rejected, (state: InventoryReceiveState, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message;
      });
  },
});

/*
 * Export reducer for store configuration.
 */
export const inventoryReceiveReducer = inventoryReceiveSlice.reducer;

export const inventoryReceiveActions = inventoryReceiveSlice.actions;
const { selectAll, selectEntities } = inventoryReceiveAdapter.getSelectors();

export const getInventoryReceiveState = (rootState: RootState): InventoryReceiveState =>
  rootState[INVENTORY_RECEIVE_FEATURE_KEY];

export const selectAllInventoryReceive = createSelector(
  getInventoryReceiveState,
  selectAll
);

export const selectInventoryReceiveEntities = createSelector(
  getInventoryReceiveState,
  selectEntities
);

export const selectInventoryCountLoadingStatus = createSelector(
    getInventoryReceiveState,
    (state: InventoryReceiveState) => state.loadingStatus
)

export const selectInventoryCountIsEmpty = createSelector(
    getInventoryReceiveState,
    (state: InventoryReceiveState) => state.ids.length === 0
)

export const selectInvReceiveFilteredList = createSelector(
    getInventoryReceiveState,
    (state: InventoryReceiveState) => state.filteredList
)




function filterList(state: InventoryReceiveState, query?: string) {
    const filteredList: Dictionary< InventoryReceiveDTO> = {};
    state.loadingStatus = 'loaded';
    
    if (!query) {
        state.filteredList = state.entities;
        return;
    }

    const lowerQuery = query.toLowerCase();
    
    state.ids.forEach(id => {
        if (state.entities[id]?.comments?.toLowerCase().indexOf(lowerQuery) === -1)
            return;

        filteredList[id] = state.entities[id];
    });

    state.filteredList = filteredList;
}

