jest.mock('@pos/shared/amplify', () => ({
  API: {
    graphql: jest.fn(),
  },
  DataStore: {
    query: jest.fn(),
  },
}));

jest.mock('@pos/auth/data-access', () => ({
  stampTenant: jest.fn((value) => value),
}));

jest.mock('@pos/shared/api', () => ({
  listEmployees: 'LIST_EMPLOYEES_QUERY',
}));

import { API, DataStore } from '@pos/shared/amplify';
import { EmployeeService } from './employee.service';

const queryMock = DataStore.query as jest.Mock;
const graphqlMock = API.graphql as jest.Mock;

describe('EmployeeService.getEmployee', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the direct predicate match when found', async () => {
    queryMock
      .mockResolvedValueOnce([
        {
          id: 'emp-1',
          pin: '1234',
          active: true,
          firstName: 'Orlando',
          lastName: 'Quero',
        },
      ]);

    const employee = await EmployeeService.getEmployee('1234');

    expect(employee).toEqual(
      expect.objectContaining({
        id: 'emp-1',
        pin: '1234',
      })
    );
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to scanning local employees when the direct predicate misses', async () => {
    queryMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'emp-1',
          pin: '1234',
          active: true,
          firstName: 'Orlando',
          lastName: 'Quero',
        },
      ]);

    const employee = await EmployeeService.getEmployee(' 1234 ');

    expect(employee).toEqual(
      expect.objectContaining({
        id: 'emp-1',
        pin: '1234',
      })
    );
    expect(queryMock).toHaveBeenCalledTimes(2);
  });

  it('falls back to the backend employee query when local data misses', async () => {
    queryMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    graphqlMock.mockResolvedValueOnce({
      data: {
        listEmployees: {
          items: [
            {
              id: 'emp-1',
              pin: '1234',
              active: true,
              firstName: 'Orlando',
              lastName: 'Quero',
            },
          ],
        },
      },
    });

    const employee = await EmployeeService.getEmployee('1234');

    expect(employee).toEqual(
      expect.objectContaining({
        id: 'emp-1',
        pin: '1234',
      })
    );
    expect(graphqlMock).toHaveBeenCalledWith(
      expect.objectContaining({
        authMode: 'userPool',
        variables: {
          limit: 100,
        },
      })
    );
  });

  it('returns null when no active employee matches the PIN', async () => {
    queryMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'emp-1',
          pin: '1234',
          active: false,
          firstName: 'Orlando',
          lastName: 'Quero',
        },
      ]);
    graphqlMock.mockResolvedValueOnce({
      data: {
        listEmployees: {
          items: [],
        },
      },
    });

    const employee = await EmployeeService.getEmployee('1234');

    expect(employee).toBeNull();
  });
});

describe('EmployeeService.getEmployeeByEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a local active employee matching email', async () => {
    queryMock.mockResolvedValueOnce([
      {
        id: 'emp-1',
        email: 'orlaqp+pos@gmail.com',
        active: true,
        firstName: 'Orlando',
        lastName: 'Quero',
      },
    ]);

    const employee = await EmployeeService.getEmployeeByEmail('Orlaqp+pos@gmail.com');

    expect(employee).toEqual(
      expect.objectContaining({
        id: 'emp-1',
        email: 'orlaqp+pos@gmail.com',
      })
    );
  });

  it('falls back to the backend employee query when local email lookup misses', async () => {
    queryMock.mockResolvedValueOnce([]);
    graphqlMock.mockResolvedValueOnce({
      data: {
        listEmployees: {
          items: [
            {
              id: 'emp-1',
              email: 'orlaqp+pos@gmail.com',
              active: true,
              firstName: 'Orlando',
              lastName: 'Quero',
            },
          ],
        },
      },
    });

    const employee = await EmployeeService.getEmployeeByEmail('orlaqp+pos@gmail.com');

    expect(employee).toEqual(
      expect.objectContaining({
        id: 'emp-1',
        email: 'orlaqp+pos@gmail.com',
      })
    );
  });
});
