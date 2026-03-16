import { buildSampleAccountSeed } from './sample-account-seed';
import { User } from './auth.slice';

describe('buildSampleAccountSeed', () => {
  const user: User = {
    id: 'tenant-123',
    tenantId: 'tenant-123',
    email: 'owner@example.com',
    email_verified: true,
    groups: [],
    name: 'Olivia Owner',
    businessName: 'Olivia Market',
  };

  it('builds a deterministic sample dataset for a tenant', () => {
    const result = buildSampleAccountSeed(user);

    expect(result.unitOfMeasures).toHaveLength(2);
    expect(result.brands).toHaveLength(2);
    expect(result.categories).toHaveLength(3);
    expect(result.employees).toHaveLength(3);
    expect(result.products).toHaveLength(4);
    expect(result.customers).toHaveLength(1);
    expect(result.discountDefinitions).toHaveLength(3);
    expect(result.employeeDiscountPolicies).toHaveLength(2);
    expect(result.orders).toHaveLength(1);

    expect(result.employees[0]).toMatchObject({
      tenantId: 'tenant-123',
      email: 'owner@example.com',
      pin: '1234',
      discountPolicyId: 'tenant-123::seed::policy-admin',
    });

    expect(result.products.map((item) => item.id)).toEqual(
      expect.arrayContaining(['ebt-bread-fixture', 'ebt-apple-fixture', 'non-ebt-soap-fixture'])
    );

    expect(result.discountDefinitions.find((item) => item.id === 'tenant-123::seed::discount-promo-welcome10'))
      .toMatchObject({
        code: 'WELCOME10',
        type: 'PROMO_CODE',
        scope: 'ORDER',
      });
  });

  it('can skip order seeds for lighter sample accounts', () => {
    const result = buildSampleAccountSeed(user, { includeOrders: false });

    expect(result.orders).toEqual([]);
  });
});
