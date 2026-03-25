import {
  clearSampleAccountData,
  resetSampleAccountData,
} from './sample-account-seed';
import { DataStore } from '@pos/shared/amplify';
import { User } from './auth.slice';

jest.mock('@pos/shared/amplify', () => ({
  DataStore: {
    query: jest.fn(),
    delete: jest.fn(),
    save: jest.fn(),
  },
}));

jest.mock('./tenant-bootstrap', () => ({
  bootstrapTenantSession: jest.fn(async () => undefined),
}));

jest.mock('@pos/shared/models', () => {
  class MockModel {
    constructor(init: Record<string, unknown>) {
      Object.assign(this, init);
    }

    static copyOf(existing: Record<string, unknown>, mutator: (draft: Record<string, unknown>) => void) {
      const draft = { ...existing };
      mutator(draft);
      return draft;
    }
  }

  return {
    Brand: MockModel,
    Category: MockModel,
    Customer: MockModel,
    DiscountDefinition: MockModel,
    Employee: MockModel,
    EmployeeDiscountPolicy: MockModel,
    GlobalSettings: MockModel,
    Order: MockModel,
    Product: MockModel,
    Store: MockModel,
    UnitOfMeasure: MockModel,
  };
});

describe('sample-account-seed runtime helpers', () => {
  const user: User = {
    id: 'tenant-123',
    tenantId: 'tenant-123',
    email: 'owner@example.com',
    email_verified: true,
    groups: [],
    name: 'Olivia Owner',
    businessName: 'Olivia Market',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes only records for the requested tenant during cleanup', async () => {
    const queryMock = jest.mocked(DataStore.query);
    const deleteMock = jest.mocked(DataStore.delete);

    queryMock.mockResolvedValue([
      { id: 'tenant-record', tenantId: 'tenant-123' },
      { id: 'other-record', tenantId: 'tenant-999' },
    ] as never);

    await clearSampleAccountData(user);

    expect(deleteMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'tenant-record', tenantId: 'tenant-123' })
    );
    expect(deleteMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ id: 'other-record', tenantId: 'tenant-999' })
    );
  });

  it('resets tenant data by cleaning first and then reseeding', async () => {
    const clearSpy = jest.spyOn(require('./sample-account-seed'), 'clearSampleAccountData');
    const seedSpy = jest.spyOn(require('./sample-account-seed'), 'seedSampleAccountData');
    seedSpy.mockResolvedValue({
      tenantId: user.tenantId,
      storeId: 'store-1',
      counts: {
        unitOfMeasures: 0,
        brands: 0,
        categories: 0,
        employees: 0,
        products: 0,
        customers: 0,
        discountDefinitions: 0,
        employeeDiscountPolicies: 0,
        orders: 0,
      },
    });

    await resetSampleAccountData(user, { includeOrders: false });

    expect(clearSpy).toHaveBeenCalledWith(user);
    expect(seedSpy).toHaveBeenCalledWith(user, { includeOrders: false });
  });
});
