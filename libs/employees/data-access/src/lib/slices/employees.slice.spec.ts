
import {
  fetchEmployees,
  EmployeesAdapter,
  EmployeesReducer,
} from './employees.slice';

describe('Employees reducer', () => {
  it('should handle initial state', () => {
    const expected = EmployeesAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    });

    expect(EmployeesReducer(undefined, { type: '' })).toEqual(expected);
  });

  it('should handle fetchEmployees', () => {
    let state = employeesReducer(
      undefined,
      fetchEmployees.pending(null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    );

    state = employeesReducer(
      state,
      fetchEmployees.fulfilled([{ id: 1 }], null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    );

    state = employeesReducer(
      state,
      fetchEmployees.rejected(new Error('Uh oh'), null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    );
  });
});
