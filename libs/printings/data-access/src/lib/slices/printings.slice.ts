
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { RootState } from '@pos/store';
import {
    createAsyncThunk,
    createSelector,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import { PrintingEntity, PrintingEntityMapper } from '../printing.entity';
import { PrintingService } from '../printer.service';

export const PRINTER_FEATURE_KEY = 'printings';

export interface PrintingsState {
  error?: string;
  selected?: PrintingEntity;
}


export const fetchSavedPrinters = createAsyncThunk(
  'printings/fetchStatus',
  async (_, thunkAPI) => {
    const printings = await PrintingService.getAll();
    return printings.map(p => PrintingEntityMapper.fromModel(p))
  }
);

export const initialPrintingsState: PrintingsState = {
    selected: undefined,
};

export const printingsSlice = createSlice({
  name: PRINTER_FEATURE_KEY,
  initialState: initialPrintingsState,
  reducers: {
    select: (state: PrintingsState, action: PayloadAction< PrintingEntity >) => {
        state.selected = action.payload;
    },
  },
});

/*
 * Export reducer for store configuration.
 */
export const printingsReducer = printingsSlice.reducer;
export const printingsActions = printingsSlice.actions;

export const getPrintingsState = (rootState: RootState): PrintingsState =>
  rootState[PRINTER_FEATURE_KEY];

export const getDefaultPrinter = createSelector(
    getPrintingsState,
    (state: PrintingsState) => state.selected
)


