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
  getStore: 'GET_STORE_QUERY',
  listStores: 'LIST_STORES_QUERY',
  updateStore: 'UPDATE_STORE_MUTATION',
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

describe('StoreInfoService.save', () => {
  const saveMock = DataStore.save as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates a remote-only store through GraphQL when it is not in local DataStore yet', async () => {
    queryMock.mockResolvedValueOnce(null);
    graphqlMock
      .mockResolvedValueOnce({
        data: {
          getStore: {
            id: 'store-1',
            name: 'Main Store',
            timezone: 'America/New_York',
            _version: 7,
            _deleted: false,
          },
        },
      })
      .mockResolvedValueOnce({ data: { updateStore: { id: 'store-1' } } });

    const dispatch = jest.fn();
    await StoreInfoService.save(dispatch, {
      id: 'store-1',
      name: 'Updated Store',
      address: '145 Market Street',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA',
      email: 'store@example.com',
      phone: '305-555-0100',
      fax: '305-555-0101',
      disclaimer: 'Thanks',
      timezone: 'America/New_York',
    });

    expect(saveMock).not.toHaveBeenCalled();
    expect(graphqlMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        query: 'GET_STORE_QUERY',
        variables: { id: 'store-1' },
        authMode: 'userPool',
      })
    );
    expect(graphqlMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        query: 'UPDATE_STORE_MUTATION',
        authMode: 'userPool',
        variables: {
          input: expect.objectContaining({
            id: 'store-1',
            name: 'Updated Store',
            _version: 7,
          }),
        },
      })
    );
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'storeInfo/set',
        payload: expect.objectContaining({
          id: 'store-1',
          name: 'Updated Store',
        }),
      })
    );
  });
});
