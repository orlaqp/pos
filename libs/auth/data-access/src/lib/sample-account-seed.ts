import {
  Brand,
  Category,
  Customer,
  DiscountDefinition,
  Employee,
  EmployeeDiscountPolicy,
  GlobalSettings,
  Order,
  Product,
  Store,
  UnitOfMeasure,
} from '@pos/shared/models';
import { DataStore } from '@pos/shared/amplify';
import { User } from './auth.slice';
import { bootstrapTenantSession } from './tenant-bootstrap';

type SeedRecord = Record<string, unknown> & { id: string };

type SampleAccountSeedOptions = {
  includeOrders?: boolean;
};

type SampleAccountSeedDataset = {
  unitOfMeasures: SeedRecord[];
  brands: SeedRecord[];
  categories: SeedRecord[];
  employees: SeedRecord[];
  products: SeedRecord[];
  customers: SeedRecord[];
  discountDefinitions: SeedRecord[];
  employeeDiscountPolicies: SeedRecord[];
  orders: SeedRecord[];
};

export type SampleAccountSeedSummary = {
  tenantId: string;
  storeId: string;
  counts: {
    unitOfMeasures: number;
    brands: number;
    categories: number;
    employees: number;
    products: number;
    customers: number;
    discountDefinitions: number;
    employeeDiscountPolicies: number;
    orders: number;
  };
};

const defaultOptions: Required<SampleAccountSeedOptions> = {
  includeOrders: true,
};

const seedId = (tenantId: string, key: string) => `${tenantId}::seed::${key}`;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

const businessName = (user: User) =>
  user.businessName?.trim() || user.name?.trim() || 'Sample Business';

const withTenant = <T extends Record<string, unknown>>(tenantId: string, input: T) => ({
  ...input,
  tenantId,
});

const assignMutableFields = (draft: Record<string, unknown>, input: SeedRecord) => {
  Object.entries(input).forEach(([key, value]) => {
    if (key === 'id' || key === 'createdAt' || key === 'updatedAt') {
      return;
    }

    draft[key] = value;
  });
};

const upsertModel = async <T extends { id: string }>(
  Model: {
    new (init: T): T;
    copyOf(source: T, mutator: (draft: Record<string, unknown>) => void): T;
  },
  input: T
) => {
  const existing = await DataStore.query(Model as never, input.id);

  if (!existing) {
    return DataStore.save(new Model(input));
  }

  return DataStore.save(
    Model.copyOf(existing as T, (draft) => {
      assignMutableFields(draft, input as unknown as SeedRecord);
    })
  );
};

const upsertStore = async (user: User) => {
  const stores = await DataStore.query(Store);
  const existing = stores[0];
  const sampleStore = withTenant(user.tenantId, {
    id: existing?.id || seedId(user.tenantId, 'store-main'),
    name: businessName(user),
    address: '145 Market Street',
    city: 'Brooklyn',
    state: 'NY',
    zipCode: '11201',
    country: 'US',
    phone: '718-555-0110',
    fax: '',
    email: user.email,
    disclaimer: 'Sample tenant seeded for development and QA workflows.',
    timezone: 'America/New_York',
  });

  return upsertModel(Store as never, sampleStore as never);
};

const upsertGlobalSettings = async (user: User) => {
  const settings = await DataStore.query(GlobalSettings);
  const existing = settings[0];
  const sampleSettings = withTenant(user.tenantId, {
    id: existing?.id || 'global-settings',
    enforceSalesBasedOnInventory: false,
    timezone: 'America/New_York',
  });

  return upsertModel(GlobalSettings as never, sampleSettings as never);
};

export const buildSampleAccountSeed = (
  user: User,
  options: SampleAccountSeedOptions = {}
): SampleAccountSeedDataset => {
  const resolved = { ...defaultOptions, ...options };
  const tenantId = user.tenantId;
  const ownerEmployeeId = seedId(tenantId, 'employee-owner');
  const cashierEmployeeId = seedId(tenantId, 'employee-cashier');
  const managerEmployeeId = seedId(tenantId, 'employee-manager');

  const eachUomId = seedId(tenantId, 'uom-each');
  const poundUomId = seedId(tenantId, 'uom-pound');

  const brandFreshId = seedId(tenantId, 'brand-fresh-harvest');
  const brandHomeId = seedId(tenantId, 'brand-homecraft');

  const categoryProduceId = seedId(tenantId, 'category-produce');
  const categoryGroceryId = seedId(tenantId, 'category-grocery');
  const categoryHouseholdId = seedId(tenantId, 'category-household');

  const breadProductId = 'ebt-bread-fixture';
  const applesProductId = 'ebt-apple-fixture';
  const soapProductId = 'non-ebt-soap-fixture';
  const coffeeProductId = seedId(tenantId, 'product-coffee');

  const customerId = seedId(tenantId, 'customer-walk-in');
  const orderId = seedId(tenantId, 'order-paid-1001');

  const discountManualId = seedId(tenantId, 'discount-manual-10off');
  const discountAutomaticId = seedId(tenantId, 'discount-automatic-produce');
  const discountPromoId = seedId(tenantId, 'discount-promo-welcome10');

  const salesPolicyId = seedId(tenantId, 'policy-sales');
  const adminPolicyId = seedId(tenantId, 'policy-admin');

  const unitOfMeasures: SeedRecord[] = [
    withTenant(tenantId, {
      id: eachUomId,
      name: 'Each',
      description: 'Default unit for countable items',
    }),
    withTenant(tenantId, {
      id: poundUomId,
      name: 'lb',
      description: 'Weighted produce sold by the pound',
    }),
  ];

  const brands: SeedRecord[] = [
    withTenant(tenantId, {
      id: brandFreshId,
      name: 'Fresh Harvest',
      description: 'Produce and staple groceries used in test accounts',
    }),
    withTenant(tenantId, {
      id: brandHomeId,
      name: 'HomeCraft',
      description: 'Household goods used in test accounts',
    }),
  ];

  const categories: SeedRecord[] = [
    withTenant(tenantId, {
      id: categoryProduceId,
      name: 'Produce',
      description: 'Fresh fruit and vegetables',
      code: 'PROD',
      color: '#61a83f',
      discountable: true,
      discountPolicyMode: 'DEFAULT',
    }),
    withTenant(tenantId, {
      id: categoryGroceryId,
      name: 'Grocery',
      description: 'Shelf-stable grocery items',
      code: 'GROC',
      color: '#e0b34a',
      discountable: true,
      discountPolicyMode: 'DEFAULT',
    }),
    withTenant(tenantId, {
      id: categoryHouseholdId,
      name: 'Household',
      description: 'Cleaning and household supplies',
      code: 'HOME',
      color: '#4a8ee0',
      discountable: false,
      discountPolicyMode: 'FORCE_EXCLUDE',
    }),
  ];

  const employees: SeedRecord[] = [
    withTenant(tenantId, {
      id: ownerEmployeeId,
      code: '01',
      firstName: user.name?.trim().split(' ')[0] || 'Owner',
      lastName: user.name?.trim().split(' ').slice(1).join(' ') || 'Account',
      middleName: '',
      dob: null,
      phone: '718-555-0101',
      email: user.email,
      pin: '1234',
      roles: ['Admin', 'Payments', 'Sales', 'Receive Check Payment', 'Void Sales', 'Remove Sales'],
      active: true,
      discountPolicyId: adminPolicyId,
      policyProfileKey: 'OWNER',
    }),
    withTenant(tenantId, {
      id: cashierEmployeeId,
      code: '02',
      firstName: 'Jamie',
      lastName: 'Cashier',
      middleName: '',
      dob: null,
      phone: '718-555-0102',
      email: `cashier+${slugify(user.email || tenantId)}@example.com`,
      pin: '2222',
      roles: ['Sales', 'Payments'],
      active: true,
      discountPolicyId: salesPolicyId,
      policyProfileKey: 'SALES',
    }),
    withTenant(tenantId, {
      id: managerEmployeeId,
      code: '03',
      firstName: 'Morgan',
      lastName: 'Manager',
      middleName: '',
      dob: null,
      phone: '718-555-0103',
      email: `manager+${slugify(user.email || tenantId)}@example.com`,
      pin: '4321',
      roles: ['Admin', 'Sales', 'Payments'],
      active: true,
      discountPolicyId: adminPolicyId,
      policyProfileKey: 'MANAGER',
    }),
  ];

  const products: SeedRecord[] = [
    withTenant(tenantId, {
      id: breadProductId,
      name: 'Bread Fixture',
      description: 'Sample EBT-eligible bread for QA flows',
      price: 3.49,
      tags: 'bread,fixture,qa',
      cost: 1.45,
      barcode: '100000000001',
      sku: 'BREAD-001',
      plu: null,
      quantity: 24,
      unitOfMeasure: 'Each',
      trackStock: true,
      reorderPoint: 6,
      reorderQuantity: 24,
      picture: null,
      productCategoryId: categoryGroceryId,
      productBrandId: brandFreshId,
      isActive: true,
      isEBTEligible: true,
      discountable: true,
      minAllowedPrice: 2.99,
      maxManualDiscountPercent: 20,
      maxManualDiscountAmount: 1.5,
    }),
    withTenant(tenantId, {
      id: applesProductId,
      name: 'Apple Fixture',
      description: 'Weighted apples for produce and EBT tests',
      price: 1.99,
      tags: 'apple,produce,fixture',
      cost: 0.89,
      barcode: '200000000002',
      sku: 'APPLE-001',
      plu: '4015',
      quantity: 40,
      unitOfMeasure: 'lb',
      trackStock: true,
      reorderPoint: 10,
      reorderQuantity: 40,
      picture: null,
      productCategoryId: categoryProduceId,
      productBrandId: brandFreshId,
      isActive: true,
      isEBTEligible: true,
      discountable: true,
      minAllowedPrice: 1.49,
      maxManualDiscountPercent: 15,
      maxManualDiscountAmount: 0.5,
    }),
    withTenant(tenantId, {
      id: soapProductId,
      name: 'Soap Fixture',
      description: 'Household item for non-EBT scenarios',
      price: 4.99,
      tags: 'soap,fixture,household',
      cost: 2.1,
      barcode: '300000000003',
      sku: 'SOAP-001',
      plu: null,
      quantity: 18,
      unitOfMeasure: 'Each',
      trackStock: true,
      reorderPoint: 4,
      reorderQuantity: 12,
      picture: null,
      productCategoryId: categoryHouseholdId,
      productBrandId: brandHomeId,
      isActive: true,
      isEBTEligible: false,
      discountable: false,
      minAllowedPrice: 4.49,
      maxManualDiscountPercent: 10,
      maxManualDiscountAmount: 0.5,
    }),
    withTenant(tenantId, {
      id: coffeeProductId,
      name: 'Coffee Beans Sample',
      description: 'Sample grocery item for promo code testing',
      price: 12.99,
      tags: 'coffee,grocery',
      cost: 7.25,
      barcode: '400000000004',
      sku: 'COFFEE-001',
      plu: null,
      quantity: 12,
      unitOfMeasure: 'Each',
      trackStock: true,
      reorderPoint: 3,
      reorderQuantity: 12,
      picture: null,
      productCategoryId: categoryGroceryId,
      productBrandId: brandFreshId,
      isActive: true,
      isEBTEligible: false,
      discountable: true,
      minAllowedPrice: 10.99,
      maxManualDiscountPercent: 12,
      maxManualDiscountAmount: 1.25,
    }),
  ];

  const customers: SeedRecord[] = [
    withTenant(tenantId, {
      id: customerId,
      firstName: 'Taylor',
      lastName: 'Walker',
      middleName: '',
      dob: null,
      phone: '718-555-0199',
      email: 'taylor.walker@example.com',
    }),
  ];

  const discountDefinitions: SeedRecord[] = [
    withTenant(tenantId, {
      id: discountManualId,
      name: 'Manager 10% line discount',
      code: null,
      description: 'Manual line discount for staff-assisted service recovery.',
      status: 'ACTIVE',
      type: 'MANUAL',
      method: 'PERCENT',
      scope: 'LINE',
      value: 10,
      priority: 100,
      stackMode: 'STACKABLE',
      approvalRequired: true,
      reasonRequired: true,
      startDate: null,
      endDate: null,
      daysOfWeek: null,
      startTime: null,
      endTime: null,
      minSubtotal: null,
      minQuantity: null,
      usageLimitTotal: null,
      usageCountTotal: 0,
      applicableProductIds: null,
      applicableCategoryIds: null,
      excludedProductIds: [soapProductId],
      excludedCategoryIds: [categoryHouseholdId],
      excludeAlreadyDiscountedItems: true,
      appliesToAllProducts: true,
      storeIds: null,
      stationIds: null,
      active: true,
    }),
    withTenant(tenantId, {
      id: discountAutomaticId,
      name: 'Produce 5% automatic',
      code: null,
      description: 'Automatic produce discount for sample QA accounts.',
      status: 'ACTIVE',
      type: 'AUTOMATIC',
      method: 'PERCENT',
      scope: 'LINE',
      value: 5,
      priority: 50,
      stackMode: 'BEST_PRICE_ONLY',
      approvalRequired: false,
      reasonRequired: false,
      startDate: null,
      endDate: null,
      daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
      startTime: '08:00',
      endTime: '18:00',
      minSubtotal: null,
      minQuantity: null,
      usageLimitTotal: null,
      usageCountTotal: 0,
      applicableProductIds: null,
      applicableCategoryIds: [categoryProduceId],
      excludedProductIds: null,
      excludedCategoryIds: null,
      excludeAlreadyDiscountedItems: true,
      appliesToAllProducts: false,
      storeIds: null,
      stationIds: null,
      active: true,
    }),
    withTenant(tenantId, {
      id: discountPromoId,
      name: 'Welcome 10',
      code: 'WELCOME10',
      description: 'Promo code used in seeded test accounts.',
      status: 'ACTIVE',
      type: 'PROMO_CODE',
      method: 'PERCENT',
      scope: 'ORDER',
      value: 10,
      priority: 25,
      stackMode: 'EXCLUSIVE',
      approvalRequired: false,
      reasonRequired: false,
      startDate: null,
      endDate: null,
      daysOfWeek: null,
      startTime: null,
      endTime: null,
      minSubtotal: 20,
      minQuantity: null,
      usageLimitTotal: 500,
      usageCountTotal: 0,
      applicableProductIds: null,
      applicableCategoryIds: null,
      excludedProductIds: [soapProductId],
      excludedCategoryIds: [categoryHouseholdId],
      excludeAlreadyDiscountedItems: false,
      appliesToAllProducts: true,
      storeIds: null,
      stationIds: null,
      active: true,
    }),
  ];

  const employeeDiscountPolicies: SeedRecord[] = [
    withTenant(tenantId, {
      id: salesPolicyId,
      employeeId: null,
      roleKey: 'Sales',
      maxManualPercentDiscount: 10,
      maxManualAmountDiscount: 5,
      maxPriceOverrideAmount: 2,
      maxPriceOverridePercentBelowBase: 10,
      canApplyOrderDiscount: false,
      canOverridePrice: false,
      canApproveDiscounts: false,
      canApprovePriceOverrides: false,
      canUsePromoCodes: true,
      requireReasonForManualDiscounts: true,
      requireReasonForOverrides: true,
      requireApprovalForOrderDiscount: true,
      requireApprovalForAnyPriceOverride: true,
      allowExclusiveDiscountOverride: false,
      active: true,
    }),
    withTenant(tenantId, {
      id: adminPolicyId,
      employeeId: null,
      roleKey: 'Admin',
      maxManualPercentDiscount: 25,
      maxManualAmountDiscount: 20,
      maxPriceOverrideAmount: 10,
      maxPriceOverridePercentBelowBase: 25,
      canApplyOrderDiscount: true,
      canOverridePrice: true,
      canApproveDiscounts: true,
      canApprovePriceOverrides: true,
      canUsePromoCodes: true,
      requireReasonForManualDiscounts: true,
      requireReasonForOverrides: true,
      requireApprovalForOrderDiscount: false,
      requireApprovalForAnyPriceOverride: false,
      allowExclusiveDiscountOverride: true,
      active: true,
    }),
  ];

  const orders: SeedRecord[] = resolved.includeOrders
    ? [
        withTenant(tenantId, {
          id: orderId,
          orderNo: '1001',
          orderDate: '2026-03-15T14:30:00.000Z',
          baseSubtotal: 11.47,
          subtotal: 10.93,
          lineDiscountTotal: 0.54,
          orderDiscountTotal: 0,
          discountTotal: 0.54,
          savingsTotal: 0.54,
          tax: 0.85,
          total: 11.78,
          promoCodes: [],
          pricingVersion: 'sample-seed-v1',
          pricingSnapshotHash: 'sample-seed-order-1001',
          pricingSource: 'ONLINE_VALIDATED',
          reconciliationStatus: 'NOT_REQUIRED',
          appliedDiscountSummary: JSON.stringify([
            {
              discountDefinitionId: discountAutomaticId,
              name: 'Produce 5% automatic',
              amount: 0.54,
            },
          ]),
          status: 'PAID',
          employeeId: ownerEmployeeId,
          employeeName: user.name || 'Owner',
          lines: [
            {
              identifier: 'line-1',
              productId: applesProductId,
              productName: 'Apple Fixture',
              unitOfMeasure: 'lb',
              barcode: '200000000002',
              sku: 'APPLE-001',
              quantity: 2,
              tax: 0,
              price: 1.99,
              basePrice: 1.99,
              overridePrice: null,
              netUnitPrice: 1.89,
              lineSubtotalBeforeOrderDiscount: 3.98,
              lineDiscountTotal: 0.2,
              allocatedOrderDiscountTotal: 0,
              lineTotalBeforeTax: 3.78,
              lineTotalAfterTax: 3.78,
              appliedDiscounts: JSON.stringify([
                {
                  discountDefinitionId: discountAutomaticId,
                  name: 'Produce 5% automatic',
                  amount: 0.2,
                },
              ]),
              categoryId: categoryProduceId,
              discountable: true,
              minAllowedPrice: 1.49,
              maxManualDiscountPercent: 15,
              maxManualDiscountAmount: 0.5,
              isEBTEligible: true,
              ebtPaidAmount: 3.78,
              nonEbtPaidAmount: 0,
            },
            {
              identifier: 'line-2',
              productId: breadProductId,
              productName: 'Bread Fixture',
              unitOfMeasure: 'Each',
              barcode: '100000000001',
              sku: 'BREAD-001',
              quantity: 2,
              tax: 0,
              price: 3.49,
              basePrice: 3.49,
              overridePrice: null,
              netUnitPrice: 3.49,
              lineSubtotalBeforeOrderDiscount: 6.98,
              lineDiscountTotal: 0,
              allocatedOrderDiscountTotal: 0,
              lineTotalBeforeTax: 6.98,
              lineTotalAfterTax: 6.98,
              appliedDiscounts: JSON.stringify([]),
              categoryId: categoryGroceryId,
              discountable: true,
              minAllowedPrice: 2.99,
              maxManualDiscountPercent: 20,
              maxManualDiscountAmount: 1.5,
              isEBTEligible: true,
              ebtPaidAmount: 6.98,
              nonEbtPaidAmount: 0,
            },
            {
              identifier: 'line-3',
              productId: soapProductId,
              productName: 'Soap Fixture',
              unitOfMeasure: 'Each',
              barcode: '300000000003',
              sku: 'SOAP-001',
              quantity: 1,
              tax: 0.85,
              price: 4.99,
              basePrice: 4.99,
              overridePrice: null,
              netUnitPrice: 4.99,
              lineSubtotalBeforeOrderDiscount: 4.99,
              lineDiscountTotal: 0,
              allocatedOrderDiscountTotal: 0,
              lineTotalBeforeTax: 4.99,
              lineTotalAfterTax: 5.84,
              appliedDiscounts: JSON.stringify([]),
              categoryId: categoryHouseholdId,
              discountable: false,
              minAllowedPrice: 4.49,
              maxManualDiscountPercent: 10,
              maxManualDiscountAmount: 0.5,
              isEBTEligible: false,
              ebtPaidAmount: 0,
              nonEbtPaidAmount: 5.84,
            },
          ],
          paymentInfo: {
            employeeId: ownerEmployeeId,
            employeeName: user.name || 'Owner',
            payments: [
              { type: 'EBT', amount: 10.76 },
              { type: 'CASH', amount: 1.02 },
            ],
          },
          refundInfo: null,
          createdBy: {
            id: ownerEmployeeId,
            name: user.name || 'Owner',
          },
          updatedBy: {
            id: ownerEmployeeId,
            name: user.name || 'Owner',
          },
          orderCustomerId: customerId,
        }),
      ]
    : [];

  return {
    unitOfMeasures,
    brands,
    categories,
    employees,
    products,
    customers,
    discountDefinitions,
    employeeDiscountPolicies,
    orders,
  };
};

export const seedSampleAccountData = async (
  user: User,
  options: SampleAccountSeedOptions = {}
): Promise<SampleAccountSeedSummary> => {
  await bootstrapTenantSession(user);

  const store = await upsertStore(user);
  await upsertGlobalSettings(user);

  const dataset = buildSampleAccountSeed(user, options);

  for (const item of dataset.unitOfMeasures) {
    await upsertModel(UnitOfMeasure as never, item as never);
  }

  for (const item of dataset.brands) {
    await upsertModel(Brand as never, item as never);
  }

  for (const item of dataset.categories) {
    await upsertModel(Category as never, item as never);
  }

  for (const item of dataset.employeeDiscountPolicies) {
    await upsertModel(EmployeeDiscountPolicy as never, item as never);
  }

  for (const item of dataset.employees) {
    await upsertModel(Employee as never, item as never);
  }

  for (const item of dataset.products) {
    await upsertModel(Product as never, item as never);
  }

  for (const item of dataset.customers) {
    await upsertModel(Customer as never, item as never);
  }

  for (const item of dataset.discountDefinitions) {
    await upsertModel(DiscountDefinition as never, item as never);
  }

  for (const item of dataset.orders) {
    await upsertModel(Order as never, item as never);
  }

  return {
    tenantId: user.tenantId,
    storeId: store.id,
    counts: {
      unitOfMeasures: dataset.unitOfMeasures.length,
      brands: dataset.brands.length,
      categories: dataset.categories.length,
      employees: dataset.employees.length,
      products: dataset.products.length,
      customers: dataset.customers.length,
      discountDefinitions: dataset.discountDefinitions.length,
      employeeDiscountPolicies: dataset.employeeDiscountPolicies.length,
      orders: dataset.orders.length,
    },
  };
};

export const clearSampleAccountData = async (user: User) => {
  console.warn(
    '[sample-account-seed] clearSampleAccountData is disabled to avoid tombstoning tenant data in shared environments.',
    { tenantId: user.tenantId }
  );
};

export const resetSampleAccountData = async (
  user: User,
  options: SampleAccountSeedOptions = {}
) => {
  return seedSampleAccountData(user, options);
};
