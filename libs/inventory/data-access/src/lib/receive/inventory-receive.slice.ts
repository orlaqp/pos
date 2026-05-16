
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
import { InventoryReceiveLineDTO } from './inventory-receive-line.entity';
import { InventoryReceiveDTO, InventoryReceiveMapper } from './inventory-receive.entity';
import { InventoryReceiveService } from './inventory-receive.service';

export const INVENTORY_RECEIVE_FEATURE_KEY = 'inventoryReceive';

export interface InventoryReceiveState extends EntityState<InventoryReceiveDTO, string> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error?: string;
  selected?: InventoryReceiveDTO;
  filterQuery?: string;
  filteredList?: InventoryReceiveDTO[];
  lines: InventoryReceiveLineDTO[];
}

export const inventoryReceiveAdapter = createEntityAdapter<InventoryReceiveDTO, string>({
    selectId: (inventoryReceive) => inventoryReceive.id ?? '',
});

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
        inventoryReceiveAdapter.addOne(state, action.payload);
        filterList(state, state.filterQuery);
    },
    remove: (state: InventoryReceiveState, action: PayloadAction<string>) => {
        inventoryReceiveAdapter.removeOne(state, action.payload);
        filterList(state, state.filterQuery);
    },
    update: (state: InventoryReceiveState, action: PayloadAction<Update<InventoryReceiveDTO, string>>) => {
        inventoryReceiveAdapter.updateOne(state, action.payload);
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
          inventoryReceiveAdapter.setAll(
              state,
              InventoryReceiveMapper.composeReceiveItems(
                  action.payload,
                  state.lines
              )
          );
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
export const getInventoryReceiveState = (rootState: RootState): InventoryReceiveState =>
  rootState[INVENTORY_RECEIVE_FEATURE_KEY];

const inventoryReceiveSelectors =
    inventoryReceiveAdapter.getSelectors<RootState>(getInventoryReceiveState);

export const selectAllInventoryReceive = createSelector(
  getInventoryReceiveState,
  (state) =>
      inventoryReceiveSelectors.selectAll({ [INVENTORY_RECEIVE_FEATURE_KEY]: state } as RootState)
);

export const selectInventoryReceiveEntities = createSelector(
  getInventoryReceiveState,
  (state) =>
      inventoryReceiveSelectors.selectEntities({ [INVENTORY_RECEIVE_FEATURE_KEY]: state } as RootState)
);

export const selectInventoryReceiveLoadingStatus = createSelector(
    getInventoryReceiveState,
    (state: InventoryReceiveState) => state.loadingStatus
)

export const selectInventoryReceiveIsEmpty = createSelector(
    getInventoryReceiveState,
    (state: InventoryReceiveState) => state.ids.length === 0
)

export const selectInventoryReceiveFilteredList = createSelector(
    getInventoryReceiveState,
    (state: InventoryReceiveState) => state.filteredList
)

const sortReceivesChronologically = (items: InventoryReceiveDTO[]) =>
    [...items].sort((left, right) => {
        const leftTime = new Date(left.createdAt || left.updatedAt || 0).getTime();
        const rightTime = new Date(right.createdAt || right.updatedAt || 0).getTime();
        return rightTime - leftTime;
    });

function filterList(state: InventoryReceiveState, query?: string) {
  state.loadingStatus = 'loaded';
  const all = sortReceivesChronologically(
      inventoryReceiveAdapter.getSelectors().selectAll(state)
  );
  
  if (!query) {
      state.filteredList = all;
      return;
  }

  const lowerQuery = query.toLowerCase();
  state.filteredList = all.filter(x => x.comments?.toLowerCase().indexOf(lowerQuery) !== -1);
}
