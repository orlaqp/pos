jest.mock('@pos/shared/amplify', () => ({
  DataStore: {
    query: jest.fn(),
    save: jest.fn(),
  },
}));

jest.mock('@pos/auth/data-access', () => ({
  stampTenant: jest.fn((value) => ({ ...value, tenantId: 'tenant-1' })),
}));

jest.mock('@pos/shared/models', () => ({
  DiscountDefinition: function DiscountDefinition(this: any, input: any) {
    Object.assign(this, input);
  },
  EmployeeDiscountPolicy: function EmployeeDiscountPolicy(this: any, input: any) {
    Object.assign(this, input);
  },
}));

import { DataStore } from '@pos/shared/amplify';
import { DiscountService } from './discount.service';
import { stampTenant } from '@pos/auth/data-access';

const queryMock = DataStore.query as jest.Mock;
const saveMock = DataStore.save as jest.Mock;

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
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it('lists policies sorted by role or employee id', async () => {
    queryMock.mockResolvedValueOnce([
      { id: '2', roleKey: 'Sales', active: true },
      { id: '1', roleKey: 'Admin', active: true },
    ]);

    const result = await DiscountService.listPolicies();

    expect(result.map((item) => item.roleKey)).toEqual(['Admin', 'Sales']);
  });
});
