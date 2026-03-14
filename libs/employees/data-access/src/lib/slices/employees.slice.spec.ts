import {
  employeesAdapter,
  employeesActions,
  employeesReducer,
  fetchEmployees,
} from './employees.slice';

describe('employees reducer', () => {
  it('returns initial state', () => {
    expect(employeesReducer(undefined, { type: '' })).toEqual(
      employeesAdapter.getInitialState({
        loadingStatus: 'not loaded',
        selected: undefined,
        filterQuery: undefined,
        filteredList: undefined,
        loginEmployee: undefined,
      })
    );
  });

  it('handles fetchEmployees pending/fulfilled/rejected', () => {
    let state = employeesReducer(undefined, fetchEmployees.pending('', undefined));
    expect(state.loadingStatus).toBe('loading');

    state = employeesReducer(
      state,
      fetchEmployees.fulfilled([{ id: '1' } as any], '', undefined)
    );
    expect(state.loadingStatus).toBe('loaded');
    expect(state.entities['1']).toEqual(expect.objectContaining({ id: '1' }));

    state = employeesReducer(
      state,
      fetchEmployees.rejected(new Error('Uh oh'), '', undefined)
    );
    expect(state.loadingStatus).toBe('error');
    expect(state.error).toBe('Uh oh');
  });

  it('stores login employee even when entity cache is not hydrated yet', () => {
    const employee = { id: 'login-1', firstName: 'EBT', lastName: 'Cashier' } as any;
    const state = employeesReducer(
      undefined,
      employeesActions.loginEmployee(employee)
    );

    expect(state.loginEmployee).toEqual(employee);
  });
});
