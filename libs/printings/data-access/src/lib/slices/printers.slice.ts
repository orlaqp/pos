
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { RootState } from '@pos/store';
import {
    createAsyncThunk,
    createSelector,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import { PrinterService } from './printer.service';
import { PrinterEntity, PrinterEntityMapper } from './printer.entity';

export const PRINTER_FEATURE_KEY = 'printings';

export interface PrinterState {
  error?: string;
  defaultPrinter?: PrinterEntity;
}


export const fetchDefaultPrinter = createAsyncThunk(
  'printings/fetchStatus',
  async (_, thunkAPI) => {
    const printer = await PrinterService.getDefaultPrinter();
    return printer ? PrinterEntityMapper.fromModel(printer) : undefined;
  }
);

export const initialPrintingsState: PrinterState = {
    defaultPrinter: undefined,
};

export const printingsSlice = createSlice({
  name: PRINTER_FEATURE_KEY,
  initialState: initialPrintingsState,
  reducers: {
    setAsDefault: (state: PrinterState, action: PayloadAction< PrinterEntity >) => {
        state.defaultPrinter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
        fetchDefaultPrinter.fulfilled,
        (state: PrinterState, action: PayloadAction<PrinterEntity | undefined>) => {
            state.defaultPrinter = action.payload;
    })
  }
});

/*
 * Export reducer for store configuration.
 */
export const printingsReducer = printingsSlice.reducer;
export const printingsActions = printingsSlice.actions;

export const getPrintingsState = (rootState: RootState): PrinterState =>
  rootState[PRINTER_FEATURE_KEY];

export const getDefaultPrinter = createSelector(
    getPrintingsState,
    (state: PrinterState) => state.defaultPrinter
)


