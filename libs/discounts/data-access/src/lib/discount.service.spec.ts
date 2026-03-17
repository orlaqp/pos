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
const graphqlMock = API.graphql as jest.Mock;

describe('DiscountService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
