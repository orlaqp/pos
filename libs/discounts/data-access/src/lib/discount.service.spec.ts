jest.mock('@pos/shared/amplify', () => ({
  API: {
    graphql: jest.fn(),
  },
  DataStore: {
    query: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    observeQuery: jest.fn(),
  },
}));

jest.mock('@pos/auth/data-access', () => ({
  stampTenant: jest.fn((value) => ({ ...value, tenantId: 'tenant-1' })),
}));

jest.mock('react-native-uuid', () => ({
  v4: jest.fn(() => 'generated-uuid'),
}));

jest.mock('@pos/shared/models', () => ({
  DiscountDefinition: Object.assign(function DiscountDefinition(this: any, input: any) {
    Object.assign(this, input);
  }, {
    copyOf: (source: any, mutator: (draft: any) => void) => {
      const draft = { ...source };
      mutator(draft);
      return draft;
    },
  }),
  EmployeeDiscountPolicy: Object.assign(function EmployeeDiscountPolicy(this: any, input: any) {
    Object.assign(this, input);
  }, {
    copyOf: (source: any, mutator: (draft: any) => void) => {
      const draft = { ...source };
      mutator(draft);
      return draft;
    },
  }),
}));

import { API, DataStore } from '@pos/shared/amplify';
import { DiscountService } from './discount.service';
import { stampTenant } from '@pos/auth/data-access';

const queryMock = DataStore.query as jest.Mock;
const saveMock = DataStore.save as jest.Mock;
const deleteMock = DataStore.delete as jest.Mock;
const observeQueryMock = DataStore.observeQuery as jest.Mock;
const graphqlMock = API.graphql as jest.Mock;

describe('DiscountService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shares definition observeQuery updates across listeners', () => {
    const unsubscribe = jest.fn();
    let observer: ((payload: { items: any[] }) => void) | undefined;

    observeQueryMock.mockReturnValueOnce({
      subscribe: (next: (payload: { items: any[] }) => void) => {
        observer = next;
        return { unsubscribe };
      },
    });

    const firstListener = jest.fn();
    const secondListener = jest.fn();

    const firstSub = DiscountService.subscribeDefinitionChanges(firstListener);
    const secondSub = DiscountService.subscribeDefinitionChanges(secondListener, 'PROMO_CODE');

    observer?.({
      items: [
        { id: 'a', name: 'Manual A', type: 'MANUAL', active: true },
        { id: 'b', name: 'Promo B', type: 'PROMO_CODE', active: true },
      ],
    });

    expect(observeQueryMock).toHaveBeenCalledTimes(1);
    expect(firstListener).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: 'a' }),
      expect.objectContaining({ id: 'b' }),
    ]);
    expect(secondListener).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: 'b' }),
    ]);

    firstSub.unsubscribe();
    expect(unsubscribe).not.toHaveBeenCalled();
    secondSub.unsubscribe();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('shares policy observeQuery updates across listeners', () => {
    const unsubscribe = jest.fn();
    let observer: ((payload: { items: any[] }) => void) | undefined;

    observeQueryMock.mockReturnValueOnce({
      subscribe: (next: (payload: { items: any[] }) => void) => {
        observer = next;
        return { unsubscribe };
      },
    });

    const firstListener = jest.fn();
    const secondListener = jest.fn();

    const firstSub = DiscountService.subscribePolicyChanges(firstListener);
    const secondSub = DiscountService.subscribePolicyChanges(secondListener);

    observer?.({
      items: [
        { id: 'policy-2', roleKey: 'Sales', active: true },
        { id: 'policy-1', roleKey: 'Admin', active: true },
      ],
    });

    expect(observeQueryMock).toHaveBeenCalledTimes(1);
    expect(firstListener).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: 'policy-1' }),
      expect.objectContaining({ id: 'policy-2' }),
    ]);
    expect(secondListener).toHaveBeenCalled();

    firstSub.unsubscribe();
    secondSub.unsubscribe();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('lists and sorts definitions by name and optional type', async () => {
    queryMock.mockResolvedValueOnce([
      { id: '2', name: 'Zulu', type: 'PROMO_CODE' },
      { id: '1', name: 'Alpha', type: 'MANUAL' },
    ]);

    const result = await DiscountService.listDefinitions('MANUAL');

    expect(result.map((item) => item.name)).toEqual(['Alpha']);
  });

  it('creates a definition with tenant stamping and defaults', async () => {
    saveMock.mockResolvedValueOnce({ id: 'created-1' });

    await DiscountService.saveDefinition({
      name: 'Holiday',
      status: 'ACTIVE',
      type: 'MANUAL',
      method: 'PERCENT',
      scope: 'LINE',
      value: 10,
      stackMode: 'STACKABLE',
      active: true,
    });

    expect(stampTenant).toHaveBeenCalled();
    expect(stampTenant).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'generated-uuid',
      })
    );
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it('gets a definition by id', async () => {
    queryMock.mockResolvedValueOnce({ id: 'disc-1', name: 'Holiday', type: 'MANUAL' });

    await expect(DiscountService.getDefinition('disc-1')).resolves.toMatchObject({
      id: 'disc-1',
      name: 'Holiday',
    });
  });

  it('returns null when definition does not exist', async () => {
    queryMock.mockResolvedValueOnce(undefined);
    graphqlMock.mockResolvedValueOnce({ data: { listDiscountDefinitions: { items: [] } } });

    await expect(DiscountService.getDefinition('missing')).resolves.toBeNull();
  });

  it('falls back to the backend when local definitions are empty', async () => {
    queryMock.mockResolvedValueOnce([]);
    graphqlMock.mockResolvedValueOnce({
      data: {
        listDiscountDefinitions: {
          items: [
            { id: '2', name: 'Zulu', type: 'PROMO_CODE', method: 'AMOUNT', scope: 'ORDER', value: 5, stackMode: 'STACKABLE', active: true, status: 'ACTIVE' },
            { id: '1', name: 'Alpha', type: 'MANUAL', method: 'PERCENT', scope: 'LINE', value: 10, stackMode: 'STACKABLE', active: true, status: 'ACTIVE' },
          ],
        },
      },
    });

    const result = await DiscountService.listDefinitions();

    expect(result.map((item) => item.name)).toEqual(['Alpha', 'Zulu']);
    expect(graphqlMock).toHaveBeenCalledWith(
      expect.objectContaining({
        authMode: 'userPool',
      })
    );
  });

  it('filters deleted definition tombstones from local queries', async () => {
    queryMock.mockResolvedValueOnce([
      { id: 'deleted-disc', name: 'Deleted', type: 'MANUAL', active: true, _deleted: true },
      { id: 'live-disc', name: 'Live', type: 'MANUAL', active: true, _deleted: false },
    ]);

    const result = await DiscountService.listDefinitions();

    expect(result.map((item) => item.id)).toEqual(['live-disc']);
  });

  it('updates an existing definition', async () => {
    queryMock.mockResolvedValueOnce({
      id: 'disc-1',
      name: 'Old',
      code: null,
      description: null,
      status: 'ACTIVE',
      type: 'PROMO_CODE',
      method: 'PERCENT',
      scope: 'LINE',
      value: 5,
      stackMode: 'STACKABLE',
      active: true,
    });
    saveMock.mockResolvedValueOnce({ id: 'disc-1' });

    await DiscountService.saveDefinition({
      id: 'disc-1',
      name: 'Updated',
      code: 'SAVE5',
      description: 'Updated description',
      status: 'ACTIVE',
      type: 'PROMO_CODE',
      method: 'AMOUNT',
      scope: 'ORDER',
      value: 5,
      stackMode: 'EXCLUSIVE',
      approvalRequired: true,
      reasonRequired: true,
      minSubtotal: 30,
      applicableCategoryIds: ['cat-1'],
      excludedProductIds: ['prod-2'],
      active: true,
    });

    expect(saveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'disc-1',
        name: 'Updated',
        code: 'SAVE5',
        method: 'AMOUNT',
        scope: 'ORDER',
        stackMode: 'EXCLUSIVE',
      })
    );
  });

  it('throws when updating a missing definition', async () => {
    queryMock.mockResolvedValueOnce(undefined);

    await expect(
      DiscountService.saveDefinition({
        id: 'missing',
        name: 'Updated',
        status: 'ACTIVE',
        type: 'MANUAL',
        method: 'PERCENT',
        scope: 'LINE',
        value: 10,
        stackMode: 'STACKABLE',
        active: true,
      })
    ).rejects.toThrow('Discount definition missing not found');
  });

  it('deletes an existing definition', async () => {
    const record = { id: 'disc-1', name: 'Delete me', _version: 3 };
    queryMock.mockResolvedValueOnce(record);
    graphqlMock.mockResolvedValueOnce({
      data: {
        deleteDiscountDefinition: {
          id: 'disc-1',
          _deleted: true,
          _version: 4,
        },
      },
    });
    deleteMock.mockResolvedValueOnce(undefined);

    await DiscountService.deleteDefinition('disc-1');

    expect(graphqlMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { input: { id: 'disc-1', _version: 3 } },
        authMode: 'userPool',
      })
    );
    expect(deleteMock).toHaveBeenCalledWith(record);
  });

  it('throws when deleting a missing definition', async () => {
    queryMock.mockResolvedValueOnce(undefined);
    graphqlMock.mockResolvedValueOnce({ data: { listDiscountDefinitions: { items: [] } } });

    await expect(DiscountService.deleteDefinition('missing')).rejects.toThrow(
      'Discount definition missing not found'
    );
  });

  it('falls back to backend delete when a definition is only available remotely', async () => {
    queryMock.mockResolvedValueOnce(undefined);
    graphqlMock
      .mockResolvedValueOnce({
        data: {
          listDiscountDefinitions: {
            items: [{ id: 'disc-remote-1', _version: 7 }],
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          deleteDiscountDefinition: {
            id: 'disc-remote-1',
            _deleted: true,
            _version: 8,
          },
        },
      });

    await DiscountService.deleteDefinition('disc-remote-1');

    expect(graphqlMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        variables: { limit: 200 },
        authMode: 'userPool',
      })
    );
    expect(graphqlMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        variables: { input: { id: 'disc-remote-1', _version: 7 } },
        authMode: 'userPool',
      })
    );
  });

  it('lists policies sorted by role or employee id', async () => {
    queryMock.mockResolvedValueOnce([
      { id: '2', roleKey: 'Sales', active: true },
      { id: '1', roleKey: 'Admin', active: true },
    ]);

    const result = await DiscountService.listPolicies();

    expect(result.map((item) => item.roleKey)).toEqual(['Admin', 'Sales']);
  });

  it('gets a policy by id', async () => {
    queryMock.mockResolvedValueOnce({ id: 'policy-1', roleKey: 'Admin', active: true });

    await expect(DiscountService.getPolicy('policy-1')).resolves.toMatchObject({
      id: 'policy-1',
      roleKey: 'Admin',
    });
  });

  it('returns null when policy does not exist', async () => {
    queryMock.mockResolvedValueOnce(undefined);
    graphqlMock.mockResolvedValueOnce({ data: { listEmployeeDiscountPolicies: { items: [] } } });

    await expect(DiscountService.getPolicy('missing')).resolves.toBeNull();
  });

  it('falls back to the backend when local policies are empty', async () => {
    queryMock.mockResolvedValueOnce([]);
    graphqlMock.mockResolvedValueOnce({
      data: {
        listEmployeeDiscountPolicies: {
          items: [
            { id: '2', roleKey: 'Sales', active: true },
            { id: '1', roleKey: 'Admin', active: true },
          ],
        },
      },
    });

    const result = await DiscountService.listPolicies();

    expect(result.map((item) => item.roleKey)).toEqual(['Admin', 'Sales']);
    expect(graphqlMock).toHaveBeenCalledWith(
      expect.objectContaining({
        authMode: 'userPool',
      })
    );
  });

  it('filters deleted policy tombstones from local queries', async () => {
    queryMock.mockResolvedValueOnce([
      { id: 'deleted-policy', roleKey: 'Sales', active: true, _deleted: true },
      { id: 'live-policy', roleKey: 'Admin', active: true, _deleted: false },
    ]);

    const result = await DiscountService.listPolicies();

    expect(result.map((item) => item.id)).toEqual(['live-policy']);
  });

  it('resolves an employee-specific policy before role policies', () => {
    const result = DiscountService.resolvePolicyForEmployee(
      { id: 'emp-1', roles: ['Sales', 'Admin'] },
      [
        { id: 'role-1', roleKey: 'Admin', active: true },
        { id: 'emp-policy', employeeId: 'emp-1', active: true },
      ] as any
    );

    expect(result).toMatchObject({ id: 'emp-policy' });
  });

  it('falls back to the first matching active role policy', () => {
    const result = DiscountService.resolvePolicyForEmployee(
      { id: 'emp-1', roles: ['Sales'] },
      [
        { id: 'inactive-role', roleKey: 'Sales', active: false },
        { id: 'role-1', roleKey: 'Sales', active: true },
      ] as any
    );

    expect(result).toMatchObject({ id: 'role-1' });
  });

  it('creates a policy with tenant stamping', async () => {
    saveMock.mockResolvedValueOnce({ id: 'policy-1' });

    await DiscountService.savePolicy({
      roleKey: 'Sales',
      maxManualPercentDiscount: 10,
      active: true,
    });

    expect(stampTenant).toHaveBeenCalled();
    expect(stampTenant).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'generated-uuid',
      })
    );
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it('updates an existing policy', async () => {
    queryMock.mockResolvedValueOnce({ id: 'policy-1', roleKey: 'Sales', active: true });
    saveMock.mockResolvedValueOnce({ id: 'policy-1' });

    await DiscountService.savePolicy({
      id: 'policy-1',
      roleKey: 'Admin',
      canApplyOrderDiscount: true,
      canApproveDiscounts: true,
      active: true,
    });

    expect(saveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'policy-1',
        roleKey: 'Admin',
        canApplyOrderDiscount: true,
        canApproveDiscounts: true,
      })
    );
  });

  it('throws when updating a missing policy', async () => {
    queryMock.mockResolvedValueOnce(undefined);

    await expect(
      DiscountService.savePolicy({
        id: 'missing',
        roleKey: 'Sales',
        active: true,
      })
    ).rejects.toThrow('Discount policy missing not found');
  });

  it('deletes an existing policy', async () => {
    const record = { id: 'policy-1', roleKey: 'Sales', _version: 6 };
    queryMock.mockResolvedValueOnce(record);
    graphqlMock.mockResolvedValueOnce({
      data: {
        deleteEmployeeDiscountPolicy: {
          id: 'policy-1',
          _deleted: true,
          _version: 7,
        },
      },
    });
    deleteMock.mockResolvedValueOnce(undefined);

    await DiscountService.deletePolicy('policy-1');

    expect(graphqlMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { input: { id: 'policy-1', _version: 6 } },
        authMode: 'userPool',
      })
    );
    expect(deleteMock).toHaveBeenCalledWith(record);
  });

  it('throws when deleting a missing policy', async () => {
    queryMock.mockResolvedValueOnce(undefined);
    graphqlMock.mockResolvedValueOnce({ data: { listEmployeeDiscountPolicies: { items: [] } } });

    await expect(DiscountService.deletePolicy('missing')).rejects.toThrow(
      'Discount policy missing not found'
    );
  });

  it('falls back to backend delete when a policy is only available remotely', async () => {
    queryMock.mockResolvedValueOnce(undefined);
    graphqlMock
      .mockResolvedValueOnce({
        data: {
          listEmployeeDiscountPolicies: {
            items: [{ id: 'policy-remote-1', _version: 4 }],
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          deleteEmployeeDiscountPolicy: {
            id: 'policy-remote-1',
            _deleted: true,
            _version: 5,
          },
        },
      });

    await DiscountService.deletePolicy('policy-remote-1');

    expect(graphqlMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        variables: { limit: 200 },
        authMode: 'userPool',
      })
    );
    expect(graphqlMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        variables: { input: { id: 'policy-remote-1', _version: 4 } },
        authMode: 'userPool',
      })
    );
  });
});
