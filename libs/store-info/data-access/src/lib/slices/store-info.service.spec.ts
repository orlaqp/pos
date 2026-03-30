/* eslint-disable import/first */
jest.mock('@pos/shared/amplify', () => ({
  API: {
    graphql: jest.fn(),
  },
  DataStore: {
    query: jest.fn(),
    save: jest.fn(),
  },
}));

jest.mock('@pos/auth/data-access', () => ({
  stampTenant: jest.fn((value) => value),
}));

jest.mock('@pos/shared/api', () => ({
  listStores: 'LIST_STORES_QUERY',
}));

jest.mock('react-native-device-info', () => ({
  __esModule: true,
  default: {
    getUniqueIdSync: jest.fn(() => 'test-device-id'),
  },
}));

import { API, DataStore } from '@pos/shared/amplify';
import { StoreInfoService } from './store-info.service';

const graphqlMock = API.graphql as jest.Mock;
const queryMock = DataStore.query as jest.Mock;

describe('StoreInfoService.getStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns hydrated local stores without hitting the backend', async () => {
    queryMock.mockResolvedValueOnce([
      {
        id: 'store-1',
        name: 'Local Store',
        address: '145 Market Street',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        phone: '305-555-0100',
      },
    ]);

    const stores = await StoreInfoService.getStore();

    expect(stores).toEqual([
      expect.objectContaining({
        id: 'store-1',
        name: 'Local Store',
      }),
    ]);
    expect(graphqlMock).not.toHaveBeenCalled();
  });

  it('falls back to backend stores when the local cache is empty', async () => {
    queryMock.mockResolvedValueOnce([]);
    graphqlMock.mockResolvedValueOnce({
      data: {
        listStores: {
          items: [
            {
              id: 'store-1',
              name: 'Casa Martinez',
              address: '145 Market Street',
              city: 'Miami',
              state: 'FL',
              zipCode: '33101',
              phone: '305-555-0100',
              _deleted: false,
            },
            {
              id: 'store-2',
              name: 'Deleted Store',
              address: 'Old address',
              city: 'Miami',
              state: 'FL',
              zipCode: '33101',
              phone: '305-555-0101',
              _deleted: true,
            },
          ],
        },
      },
    });

    const stores = await StoreInfoService.getStore();

    expect(stores).toEqual([
      expect.objectContaining({
        id: 'store-1',
        name: 'Casa Martinez',
      }),
    ]);
    expect(graphqlMock).toHaveBeenCalledWith(
      expect.objectContaining({
        authMode: 'userPool',
        variables: {
          limit: 100,
        },
      })
    );
  });

  it('falls back to backend stores when the local preferred store is still a placeholder', async () => {
    queryMock.mockResolvedValueOnce([
      {
        id: 'placeholder-store',
        name: 'Casa Martinez',
        address: 'Update in settings',
        city: 'Update in settings',
        state: 'NA',
        zipCode: '00000',
        phone: '000-000-0000',
      },
    ]);
    graphqlMock.mockResolvedValueOnce({
      data: {
        listStores: {
          items: [
            {
              id: 'store-1',
              name: 'Casa Martinez',
              address: '145 Market Street',
              city: 'Miami',
              state: 'FL',
              zipCode: '33101',
              phone: '305-555-0100',
              _deleted: false,
            },
          ],
        },
      },
    });

    const stores = await StoreInfoService.getStore();

    expect(stores).toEqual([
      expect.objectContaining({ id: 'placeholder-store' }),
      expect.objectContaining({ id: 'store-1' }),
    ]);
  });
});
