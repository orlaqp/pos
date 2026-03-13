import {
  fetchDefaultPrinter,
  initialPrintingsState,
  printingsActions,
  printingsReducer,
} from './printers.slice';

describe('printings reducer', () => {
  it('returns initial state', () => {
    expect(printingsReducer(undefined, { type: '' })).toEqual(initialPrintingsState);
  });

  it('handles setAsDefault', () => {
    const printer = { id: 'printer-1', name: 'P1' } as any;
    const state = printingsReducer(undefined, printingsActions.setAsDefault(printer));
    expect(state.defaultPrinter).toEqual(printer);
  });

  it('handles fetchDefaultPrinter.fulfilled', () => {
    const printer = { id: 'printer-1', name: 'P1' } as any;
    const state = printingsReducer(
      undefined,
      fetchDefaultPrinter.fulfilled(printer, '', undefined)
    );
    expect(state.defaultPrinter).toEqual(printer);
  });
});
