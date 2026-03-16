jest.mock('@pos/shared/amplify', () => ({
  DataStore: {
    clear: jest.fn(),
    observeQuery: jest.fn(),
  },
}));

import {
  employeesAdapter,
  employeesActions,
  employeesReducer,
  fetchEmployees,
} from './employees.slice';
import { DataStore } from '@pos/shared/amplify';

const observeQueryMock = DataStore.observeQuery as jest.Mock;

describe('employees reducer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns initial state', () => {
    expect(employeesReducer(undefined, { type: '' })).toEqual(
      employeesAdapter.getInitialState({
        loadingStatus: 'not loaded',
        selected: undefined,
        filterQuery: undefined,
        filteredList: undefined,
        loginEmployee: undefined,
        initialSyncComplete: false,
      })
    );
  });

  it('handles fetchEmployees pending/fulfilled/rejected', () => {
    let state = employeesReducer(undefined, fetchEmployees.pending('', undefined));
    expect(state.loadingStatus).toBe('loading');

    state = employeesReducer(
      state,
      fetchEmployees.fulfilled(
        { employees: [{ id: '1' } as any], initialSyncComplete: true },
        '',
        undefined
      )
    );
    expect(state.loadingStatus).toBe('loaded');
    expect(state.entities['1']).toEqual(expect.objectContaining({ id: '1' }));
    expect(state.initialSyncComplete).toBe(true);

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

  it('waits for synced employees before fulfilling fetchEmployees', async () => {
    observeQueryMock.mockImplementation(() => ({
      subscribe: ({ next }: { next: (value: unknown) => void }) => {
        next({
          isSynced: false,
          items: [],
        });
        next({
          isSynced: true,
          items: [
            {
              id: 'emp-1',
              firstName: 'Orlando',
              lastName: 'Quero',
              active: true,
            },
          ],
        });

        return { unsubscribe: jest.fn() };
      },
    }));

    const action = await fetchEmployees()(
      jest.fn(),
      jest.fn(),
      undefined
    );

    expect(action.type).toBe('employees/fetchStatus/fulfilled');
    expect(action.payload).toEqual({
      employees: [
        expect.objectContaining({
          id: 'emp-1',
          firstName: 'Orlando',
          lastName: 'Quero',
        }),
      ],
      initialSyncComplete: true,
    });
    expect(action.meta.requestStatus).toBe('fulfilled');
  });
});
