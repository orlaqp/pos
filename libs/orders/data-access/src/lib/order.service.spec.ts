/* eslint-disable @nx/enforce-module-boundaries */
import {
  buildEbtAllocations,
  getEbtEligibleTotal,
  getLineTotal,
  sumEbtPayment,
  validateEbtPayment,
} from './ebt-allocation';
import { getInventoryQuantityDelta, OrderService } from './order.service';
import { API, DataStore } from '@pos/shared/amplify';
import { StationService } from '@pos/settings/data-access';
import { stampTenant } from '@pos/auth/data-access';
import { Alert } from 'react-native';

jest.mock('@pos/shared/amplify', () => ({
  API: {
    graphql: jest.fn(),
  },
  DataStore: {
    save: jest.fn(async (value) => value),
    query: jest.fn(),
  },
}));

jest.mock('@pos/settings/data-access', () => ({
  StationService: {
    getNextOrderNumber: jest.fn(async () => '51-25-260316-0005'),
  },
}));

jest.mock('@pos/auth/data-access', () => ({
  stampTenant: jest.fn((value) => value),
  requireCurrentTenantId: jest.fn(() => 'test-tenant'),
}));

jest.mock('@pos/employees/data-access', () => ({
  EmployeeService: {
    getById: jest.fn(),
  },
}));

jest.mock('react-native-uuid', () => ({
  v4: jest.fn(() => 'generated-order-id'),
}));
jest.mock('@pos/shared/models', () => {
  const actual = jest.requireActual('@pos/shared/models');

  class MockOrder {
    constructor(init: Record<string, unknown>) {
      Object.assign(this, init);
    }
  }

  (MockOrder as any).copyOf = (
    existing: Record<string, unknown>,
    mutator: (draft: Record<string, unknown>) => void
  ) => {
    const draft = {
      ...existing,
    };
    mutator(draft);
    return draft;
  };

  class MockOrderLine {
    constructor(init: Record<string, unknown>) {
      Object.assign(this, init);
    }
  }

  class MockProduct {
    constructor(init: Record<string, unknown>) {
      Object.assign(this, init);
    }
  }

  class MockPayment {
    constructor(init: Record<string, unknown>) {
      Object.assign(this, init);
    }
  }

  class MockOrderRefund {
    constructor(init: Record<string, unknown>) {
      Object.assign(this, init);
    }
  }

  (MockOrderRefund as any).copyOf = (
    existing: Record<string, unknown>,
    mutator: (draft: Record<string, unknown>) => void
  ) => {
    const draft = {
      ...existing,
    };
    mutator(draft);
    return draft;
  };

  class MockOrderRefundLine {
    constructor(init: Record<string, unknown>) {
      Object.assign(this, init);
    }
  }

  class MockOrderDiscountDefinitionSnapshot {
    constructor(init: Record<string, unknown>) {
      Object.assign(this, init);
    }
  }

  (MockProduct as any).copyOf = (existing: Record<string, unknown>, mutator: (draft: Record<string, unknown>) => void) => {
    const draft = {
      ...existing,
    };
    mutator(draft);
    return draft;
  };

  return {
    ...actual,
    Order: MockOrder,
    OrderLine: MockOrderLine,
    OrderRefund: MockOrderRefund,
    OrderRefundLine: MockOrderRefundLine,
    OrderDiscountDefinitionSnapshot: MockOrderDiscountDefinitionSnapshot,
    Payment: MockPayment,
    Product: MockProduct,
  };
});

describe('order.service EBT helpers', () => {
  const lines = [
    { identifier: 'line-1', quantity: 2, price: 4, isEBTEligible: true },
    { identifier: 'line-2', quantity: 1, price: 11, isEBTEligible: false },
  ];

  it('sums only EBT payments', () => {
    const total = sumEbtPayment([
      { type: 'EBT', amount: 5 },
      { type: 'cash', amount: 20 },
      { type: 'ebt', amount: 1.5 },
    ]);

    expect(total).toBe(6.5);
  });

  it('computes line totals with 2-digit precision', () => {
    expect(getLineTotal(3, 1.3333)).toBe(4);
  });

  it('computes EBT-eligible subtotal from eligible lines only', () => {
    expect(getEbtEligibleTotal(lines)).toBe(8);
  });

  it('blocks EBT overpayment beyond EBT-eligible subtotal', () => {
    const result = validateEbtPayment(lines, [{ type: 'EBT', amount: 9 }]);

    expect(result.valid).toBe(false);
    expect(result.ebtEligibleTotal).toBe(8);
    expect(result.ebtPaymentTotal).toBe(9);
  });

  it('allocates EBT to eligible lines first and keeps remainder non-EBT', () => {
    const allocations = buildEbtAllocations(lines, [{ type: 'EBT', amount: 5 }]);

    expect(allocations['line-1']).toEqual({
      isEBTEligible: true,
      ebtPaidAmount: 5,
      nonEbtPaidAmount: 3,
    });
    expect(allocations['line-2']).toEqual({
      isEBTEligible: false,
      ebtPaidAmount: 0,
      nonEbtPaidAmount: 11,
    });
  });

  it('handles coupon-discounted baskets across multiple payment-card combinations', () => {
    const discountedLines = [
      { identifier: 'eligible-line', quantity: 1, price: 6.3, isEBTEligible: true },
      { identifier: 'non-eligible-line', quantity: 1, price: 4.5, isEBTEligible: false },
    ];

    const scenarios = [
      {
        name: 'cash only',
        payments: [{ type: 'cash', amount: 10.8 }],
        valid: true,
        expectedAllocations: {
          'eligible-line': { isEBTEligible: true, ebtPaidAmount: 0, nonEbtPaidAmount: 6.3 },
          'non-eligible-line': { isEBTEligible: false, ebtPaidAmount: 0, nonEbtPaidAmount: 4.5 },
        },
      },
      {
        name: 'credit card only',
        payments: [{ type: 'CC', amount: 10.8 }],
        valid: true,
        expectedAllocations: {
          'eligible-line': { isEBTEligible: true, ebtPaidAmount: 0, nonEbtPaidAmount: 6.3 },
          'non-eligible-line': { isEBTEligible: false, ebtPaidAmount: 0, nonEbtPaidAmount: 4.5 },
        },
      },
      {
        name: 'split EBT and cash',
        payments: [
          { type: 'EBT', amount: 6.3 },
          { type: 'cash', amount: 4.5 },
        ],
        valid: true,
        expectedAllocations: {
          'eligible-line': { isEBTEligible: true, ebtPaidAmount: 6.3, nonEbtPaidAmount: 0 },
          'non-eligible-line': { isEBTEligible: false, ebtPaidAmount: 0, nonEbtPaidAmount: 4.5 },
        },
      },
      {
        name: 'split EBT and credit card',
        payments: [
          { type: 'EBT', amount: 6.3 },
          { type: 'CC', amount: 4.5 },
        ],
        valid: true,
        expectedAllocations: {
          'eligible-line': { isEBTEligible: true, ebtPaidAmount: 6.3, nonEbtPaidAmount: 0 },
          'non-eligible-line': { isEBTEligible: false, ebtPaidAmount: 0, nonEbtPaidAmount: 4.5 },
        },
      },
      {
        name: 'split EBT cash and check',
        payments: [
          { type: 'EBT', amount: 4 },
          { type: 'cash', amount: 3 },
          { type: 'check', amount: 3.8 },
        ],
        valid: true,
        expectedAllocations: {
          'eligible-line': { isEBTEligible: true, ebtPaidAmount: 4, nonEbtPaidAmount: 2.3 },
          'non-eligible-line': { isEBTEligible: false, ebtPaidAmount: 0, nonEbtPaidAmount: 4.5 },
        },
      },
      {
        name: 'rejects EBT above discounted eligible total',
        payments: [
          { type: 'EBT', amount: 7 },
          { type: 'cash', amount: 3.8 },
        ],
        valid: false,
        expectedAllocations: {
          'eligible-line': { isEBTEligible: true, ebtPaidAmount: 6.3, nonEbtPaidAmount: 0 },
          'non-eligible-line': { isEBTEligible: false, ebtPaidAmount: 0, nonEbtPaidAmount: 4.5 },
        },
      },
    ];

    scenarios.forEach((scenario) => {
      const validation = validateEbtPayment(discountedLines, scenario.payments);
      const allocations = buildEbtAllocations(discountedLines, scenario.payments);

      expect(validation.valid).toBe(scenario.valid);
      expect(validation.ebtEligibleTotal).toBe(6.3);
      expect(allocations).toEqual(scenario.expectedAllocations);
    });
  });
});

describe('OrderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(API.graphql).mockResolvedValue({ data: {} } as any);
    jest
      .mocked(DataStore.save)
      .mockImplementation(async (value) => value as any);
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
  });

  it('marks a closed order as pending inventory application instead of updating products directly', async () => {
    const saveMock = jest.mocked(DataStore.save);
    const queryMock = jest.mocked(DataStore.query);
    const savedOrder = {
      id: 'order-1',
      status: 'PAID',
      lines: [],
      paymentInfo: { payments: [] },
      inventoryApplyState: 'PENDING',
      inventoryApplyOperationId: 'ORDER:order-1:PAID',
    } as any;

    queryMock.mockResolvedValue({
      id: 'order-1',
      status: 'OPEN',
      tenantId: 'tenant-1',
    } as any);
    saveMock.mockResolvedValue(savedOrder);

    const result = await OrderService.closeOrder({
      id: 'order-1',
      by: {
        id: 'employee-1',
        firstName: 'Orlando',
        lastName: 'Quero',
      } as any,
      order: {
        items: [
          {
            identifier: 'line-1',
            quantity: 1,
            product: {
              id: 'product-1',
              name: 'Rice',
              price: 4.59,
              unitOfMeasure: 'ea',
              isEBTEligible: true,
            },
          },
        ],
        footer: {
          baseSubtotal: 4.59,
          subtotal: 4.59,
          total: 4.59,
          lineDiscountTotal: 0,
          orderDiscountTotal: 0,
          discount: 0,
          savingsTotal: 0,
          pricingSource: 'OFFLINE_LOCAL',
          reconciliationStatus: 'PENDING',
        },
        promoCodes: [],
        appliedDiscountSummary: undefined,
      } as any,
      payments: [{ type: 'cash', amount: 4.59 }],
    });

    expect(queryMock).toHaveBeenCalledWith(expect.anything(), 'order-1');
    expect(saveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'PAID',
        inventoryApplyState: 'PENDING',
        inventoryApplyOperationId: 'ORDER:order-1:PAID',
        inventoryAppliedAt: null,
        inventoryApplyError: null,
      })
    );
    expect(result).toBe(savedOrder);
    expect(Alert.alert).not.toHaveBeenCalledWith(
      'Inventory update failed',
      expect.anything()
    );
  });

  it('creates a paid order directly for one-step checkout with pending inventory metadata', async () => {
    const saveMock = jest.mocked(DataStore.save);

    saveMock.mockResolvedValue({
      id: 'order-2',
      status: 'PAID',
      orderNo: '51-25-260316-0007',
      lines: [],
      paymentInfo: { payments: [] },
      inventoryApplyState: 'PENDING',
      inventoryApplyOperationId: 'ORDER:generated-cart-id:PAID',
    } as any);

    const result = await OrderService.createPaidOrder({
      by: {
        id: 'employee-1',
        firstName: 'Orlando',
        lastName: 'Quero',
      } as any,
      order: {
        id: 'generated-cart-id',
        orderNo: '51-25-260316-0007',
        items: [
          {
            identifier: 'line-1',
            quantity: 1,
            product: {
              id: 'product-1',
              name: 'Rice',
              price: 4.59,
              unitOfMeasure: 'ea',
              isEBTEligible: true,
            },
          },
        ],
        footer: {
          baseSubtotal: 4.59,
          subtotal: 4.59,
          total: 4.59,
          lineDiscountTotal: 0,
          orderDiscountTotal: 0,
          discount: 0,
          savingsTotal: 0,
          pricingSource: 'OFFLINE_LOCAL',
          reconciliationStatus: 'PENDING',
        },
        promoCodes: [],
        appliedDiscountSummary: undefined,
      } as any,
      payments: [{ type: 'cash', amount: 4.59 }],
    });

    expect(saveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'generated-cart-id',
        status: 'PAID',
        inventoryApplyState: 'PENDING',
        inventoryApplyOperationId: 'ORDER:generated-cart-id:PAID',
      })
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 'order-2',
        status: 'PAID',
      })
    );
  });

  it('blocks EBT overpayment against discounted eligible totals when creating a paid order', async () => {
    const saveMock = jest.mocked(DataStore.save);

    const result = await OrderService.createPaidOrder({
      by: {
        id: 'employee-1',
        firstName: 'Orlando',
        lastName: 'Quero',
      } as any,
      order: {
        id: 'generated-cart-id',
        orderNo: '51-25-260316-0008',
        items: [
          {
            identifier: 'eligible-line',
            quantity: 2,
            product: {
              id: 'product-1',
              name: 'Eligible discounted item',
              price: 10,
              unitOfMeasure: 'ea',
              isEBTEligible: true,
            },
          },
          {
            identifier: 'non-ebt-line',
            quantity: 1,
            product: {
              id: 'product-2',
              name: 'Non EBT item',
              price: 20,
              unitOfMeasure: 'ea',
              isEBTEligible: false,
            },
          },
        ],
        footer: {
          baseSubtotal: 40,
          subtotal: 25.24,
          total: 25.24,
          lineDiscountTotal: 5,
          orderDiscountTotal: 9.76,
          discount: 14.76,
          savingsTotal: 14.76,
          pricingSource: 'OFFLINE_LOCAL',
          reconciliationStatus: 'PENDING',
        },
        promoCodes: [],
        appliedDiscountSummary: {
          applications: [],
          approvalEvents: [],
          lineSummaries: [
            {
              lineId: 'eligible-line',
              discounts: [],
              lineDiscountTotal: 5,
              allocatedOrderDiscountTotal: 9.76,
              lineTotalBeforeTax: 5.24,
            },
            {
              lineId: 'non-ebt-line',
              discounts: [],
              lineDiscountTotal: 0,
              allocatedOrderDiscountTotal: 0,
              lineTotalBeforeTax: 20,
            },
          ],
          orderLevelAdjustments: [],
          warnings: [],
          pricingGeneratedAt: '2026-04-21T19:30:00.000Z',
        },
      } as any,
      payments: [{ type: 'EBT', amount: 25.24 }],
    });

    expect(result).toBeNull();
    expect(Alert.alert).toHaveBeenCalledWith(
      'EBT validation failed',
      expect.stringContaining('$5.24')
    );
    expect(saveMock).not.toHaveBeenCalled();
  });

  it('snapshots only applied automatic and promo definitions when an order is paid', async () => {
    const saveMock = jest.mocked(DataStore.save);
    const queryMock = jest.mocked(DataStore.query);
    const sharedModels = jest.requireMock('@pos/shared/models');

    queryMock.mockImplementation(async (model: any, arg?: any) => {
      if (model === sharedModels.OrderDiscountDefinitionSnapshot) {
        return null;
      }
      return null;
    });

    await OrderService.createPaidOrder({
      by: {
        id: 'employee-1',
        firstName: 'Orlando',
        lastName: 'Quero',
      } as any,
      order: {
        id: 'generated-cart-id',
        orderNo: '51-25-260316-0007',
        items: [
          {
            identifier: 'line-1',
            quantity: 3,
            product: {
              id: 'huevo',
              name: 'Huevo',
              price: 4.99,
              categoryId: 'cat-1',
              unitOfMeasure: 'ea',
              isEBTEligible: true,
              discountable: true,
            },
          },
        ],
        footer: {
          baseSubtotal: 14.97,
          subtotal: 10.48,
          total: 10.48,
          lineDiscountTotal: 4.49,
          orderDiscountTotal: 0,
          discount: 4.49,
          savingsTotal: 4.49,
          pricingSource: 'OFFLINE_LOCAL',
          reconciliationStatus: 'PENDING',
        },
        pricingContext: {
          timezone: 'America/New_York',
          storeId: 'store-1',
          stationId: '51',
        },
        promoCodes: [],
        definitions: [
          {
            id: 'discount-1',
            name: 'Test 1%',
            status: 'ACTIVE',
            type: 'AUTOMATIC',
            method: 'PERCENT',
            scope: 'LINE',
            value: 30,
            stackMode: 'STACKABLE',
            minSubtotal: 12,
            applicableProductIds: ['huevo'],
            appliesToAllProducts: false,
            active: true,
          },
          {
            id: 'manual-1',
            name: 'Manual',
            status: 'ACTIVE',
            type: 'MANUAL',
            method: 'PERCENT',
            scope: 'LINE',
            value: 10,
            stackMode: 'STACKABLE',
            active: true,
          },
        ],
        appliedDiscountSummary: {
          applications: [
            {
              discountApplicationId: 'application-1',
              discountDefinitionId: 'discount-1',
              applicationType: 'AUTOMATIC_DISCOUNT',
              scope: 'LINE',
              method: 'PERCENT',
              name: 'Test 1%',
              code: null,
              stackMode: 'STACKABLE',
              source: 'automatic',
              value: 30,
              originalAmount: 14.97,
              discountAmount: 4.49,
              finalAmount: 10.48,
              quantityBasis: 3,
              approvalRequired: false,
              approvalStatus: 'NOT_REQUIRED',
              appliedAt: '2026-03-16T12:00:00.000Z',
            },
            {
              discountApplicationId: 'application-2',
              discountDefinitionId: null,
              applicationType: 'MANUAL_LINE_DISCOUNT',
              scope: 'LINE',
              method: 'PERCENT',
              name: 'Manual',
              code: null,
              stackMode: 'STACKABLE',
              source: 'manual',
              value: 10,
              originalAmount: 10,
              discountAmount: 1,
              finalAmount: 9,
              quantityBasis: 1,
              approvalRequired: false,
              approvalStatus: 'NOT_REQUIRED',
              appliedAt: '2026-03-16T12:00:00.000Z',
            },
          ],
          approvalEvents: [],
          lineSummaries: [
            {
              lineId: 'line-1',
              discounts: [
                {
                  discountApplicationId: 'application-1',
                  discountDefinitionId: 'discount-1',
                  applicationType: 'AUTOMATIC_DISCOUNT',
                  scope: 'LINE',
                  method: 'PERCENT',
                  name: 'Test 1%',
                  code: null,
                  stackMode: 'STACKABLE',
                  source: 'automatic',
                  value: 30,
                  originalAmount: 14.97,
                  discountAmount: 4.49,
                  finalAmount: 10.48,
                  quantityBasis: 3,
                  approvalRequired: false,
                  approvalStatus: 'NOT_REQUIRED',
                  appliedAt: '2026-03-16T12:00:00.000Z',
                },
              ],
              lineDiscountTotal: 4.49,
              allocatedOrderDiscountTotal: 0,
              lineTotalBeforeTax: 10.48,
            },
          ],
          orderLevelAdjustments: [],
          warnings: [],
          pricingGeneratedAt: '2026-03-16T12:00:00.000Z',
        },
      } as any,
      payments: [{ type: 'cash', amount: 10.48 }],
    });

    expect(saveMock).toHaveBeenCalledTimes(2);
    const savedOrder = saveMock.mock.calls[0][0] as any;
    expect(savedOrder.appliedDiscountSummary.applications[0]).toEqual(
      expect.objectContaining({
        discountDefinitionId: 'discount-1',
        orderDiscountSnapshotId: 'generated-cart-id:discount-1',
      })
    );
    expect(savedOrder.appliedDiscountSummary.applications[1]).toEqual(
      expect.not.objectContaining({
        orderDiscountSnapshotId: expect.anything(),
      })
    );
    expect(saveMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        id: 'generated-cart-id:discount-1',
        orderId: 'generated-cart-id',
        discountDefinitionId: 'discount-1',
        pricingTimezone: 'America/New_York',
        pricingStoreId: 'store-1',
        pricingStationId: '51',
      })
    );
  });

  it('uses a negative quantity delta for paid orders', () => {
    expect(getInventoryQuantityDelta('PAID', 3)).toBe(-3);
  });

  it('uses a positive quantity delta for refunded orders', () => {
    expect(getInventoryQuantityDelta('REFUNDED', 3)).toBe(3);
  });

  it('reuses a preallocated cart id and order number when creating an order', async () => {
    const saveMock = jest.mocked(DataStore.save);
    const getNextOrderNumberMock = jest.mocked(StationService.getNextOrderNumber);

    await OrderService.create({
      by: {
        id: 'employee-1',
        firstName: 'Orlando',
        lastName: 'Quero',
      } as any,
      order: {
        id: 'generated-cart-id',
        orderNo: '51-25-260316-0099',
        items: [],
        footer: {
          baseSubtotal: 0,
          subtotal: 0,
          total: 0,
          lineDiscountTotal: 0,
          orderDiscountTotal: 0,
          discount: 0,
          savingsTotal: 0,
          pricingSource: 'OFFLINE_LOCAL',
          reconciliationStatus: 'PENDING',
        },
        promoCodes: [],
        appliedDiscountSummary: undefined,
      } as any,
    });

    expect(getNextOrderNumberMock).not.toHaveBeenCalled();
    expect(saveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'generated-cart-id',
        orderNo: '51-25-260316-0099',
      })
    );
  });

  it('generates an order id when one is not provided', async () => {
    const saveMock = jest.mocked(DataStore.save);

    await OrderService.create({
      by: {
        id: 'employee-1',
        firstName: 'Orlando',
        lastName: 'Quero',
      } as any,
      order: {
        items: [],
        footer: {
          baseSubtotal: 0,
          subtotal: 0,
          total: 0,
          lineDiscountTotal: 0,
          orderDiscountTotal: 0,
          discount: 0,
          savingsTotal: 0,
          pricingSource: 'OFFLINE_LOCAL',
          reconciliationStatus: 'PENDING',
        },
        promoCodes: [],
        appliedDiscountSummary: undefined,
      } as any,
    });

    expect(saveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'generated-order-id',
      })
    );
  });
  it('stores line applied discounts alongside the order summary', async () => {
    const saveMock = jest.mocked(DataStore.save);
    const getNextOrderNumberMock = jest.mocked(StationService.getNextOrderNumber);
    const stampTenantMock = jest.mocked(stampTenant);
    getNextOrderNumberMock.mockResolvedValue('51-25-260316-0005');
    stampTenantMock.mockImplementation((value) => value);

    await OrderService.create({
      by: {
        id: 'employee-1',
        firstName: 'Orlando',
        lastName: 'Quero',
        email: 'orlaqp+pos@gmail.com',
      } as any,
      order: {
        items: [
          {
            identifier: 'line-1',
            quantity: 2,
            product: {
              id: 'product-1',
              name: 'Rice',
              price: 4.59,
              categoryId: 'category-1',
              unitOfMeasure: 'ea',
              barcode: '123',
              sku: 'RICE-1',
              discountable: true,
              isEBTEligible: true,
            },
          },
        ],
        footer: {
          baseSubtotal: 9.18,
          subtotal: 8.18,
          lineDiscountTotal: 1,
          orderDiscountTotal: 0,
          tax: 0,
          discount: 1,
          savingsTotal: 1,
          total: 8.18,
          pricingSource: 'ONLINE_VALIDATED',
          reconciliationStatus: 'NOT_REQUIRED',
        },
        promoCodes: [],
        manualDiscounts: [],
        priceOverrides: [],
        approvalEvents: [],
        appliedDiscountSummary: {
          applications: [
            {
              discountApplicationId: 'application-1',
              discountDefinitionId: 'definition-1',
              applicationType: 'AUTOMATIC_DISCOUNT',
              scope: 'LINE',
              method: 'AMOUNT',
              name: 'Line discount',
              code: null,
              stackMode: 'STACKABLE',
              source: 'automatic',
              value: 0.5,
              originalAmount: 9.18,
              discountAmount: 1,
              finalAmount: 8.18,
              quantityBasis: 2,
              reasonCode: null,
              reasonNote: null,
              appliedByEmployeeId: null,
              appliedByEmployeeName: null,
              approvedByEmployeeId: null,
              approvedByEmployeeName: null,
              approvalRequired: false,
              approvalStatus: 'NOT_REQUIRED',
              approvalReference: null,
              sourceSnapshot: null,
              appliedAt: '2026-03-16T12:00:00.000Z',
            },
          ],
          approvalEvents: [],
          lineSummaries: [
            {
              lineId: 'line-1',
              discounts: [
                {
                  discountApplicationId: 'application-1',
                  discountDefinitionId: 'definition-1',
                  applicationType: 'AUTOMATIC_DISCOUNT',
                  scope: 'LINE',
                  method: 'AMOUNT',
                  name: 'Line discount',
                  code: null,
                  stackMode: 'STACKABLE',
                  source: 'automatic',
                  value: 0.5,
                  originalAmount: 9.18,
                  discountAmount: 1,
                  finalAmount: 8.18,
                  quantityBasis: 2,
                  reasonCode: null,
                  reasonNote: null,
                  appliedByEmployeeId: null,
                  appliedByEmployeeName: null,
                  approvedByEmployeeId: null,
                  approvedByEmployeeName: null,
                  approvalRequired: false,
                  approvalStatus: 'NOT_REQUIRED',
                  approvalReference: null,
                  sourceSnapshot: null,
                  appliedAt: '2026-03-16T12:00:00.000Z',
                },
              ],
              lineDiscountTotal: 1,
              allocatedOrderDiscountTotal: 0,
              lineTotalBeforeTax: 8.18,
            },
          ],
          orderLevelAdjustments: [],
          warnings: [],
          pricingGeneratedAt: '2026-03-16T12:00:00.000Z',
        },
      },
    });

    expect(saveMock).toHaveBeenCalledTimes(1);
    const savedOrder = saveMock.mock.calls[0][0] as any;
    expect(Array.isArray(savedOrder.lines[0].appliedDiscounts)).toBe(true);
    expect(savedOrder.lines[0].appliedDiscounts).toEqual([
      expect.objectContaining({
        discountApplicationId: 'application-1',
        applicationType: 'AUTOMATIC_DISCOUNT',
      }),
    ]);
    expect(savedOrder.appliedDiscountSummary).toEqual(
      expect.objectContaining({
        applications: [
          expect.objectContaining({
            discountApplicationId: 'application-1',
            applicationType: 'AUTOMATIC_DISCOUNT',
          }),
        ],
      })
    );
  });

  it('stamps tenant ownership and creates refund records for a partial refund', async () => {
    const queryMock = jest.mocked(DataStore.query);
    const saveMock = jest.mocked(DataStore.save);
    const sharedModels = jest.requireMock('@pos/shared/models');

    queryMock.mockResolvedValueOnce({
      id: 'order-1',
      tenantId: undefined,
      status: 'PAID',
      employeeId: 'employee-1',
      orderNo: '51-25-260316-0001',
      subtotal: 10,
      tax: 0,
      total: 10,
      lines: [
        {
          identifier: 'line-1',
          productId: 'product-1',
          productName: 'Rice',
          quantity: 2,
          price: 5,
          unitOfMeasure: 'LB',
          barcode: null,
          sku: null,
        },
      ],
      orderDate: '2026-03-16T12:00:00.000Z',
      createdAt: '2026-03-16T12:00:00.000Z',
      updatedAt: '2026-03-16T12:00:00.000Z',
    } as any);
    queryMock.mockResolvedValueOnce([]);

    (sharedModels.Order as any).copyOf = (_existing: any, mutator: (draft: any) => void) => {
      const draft = {
        id: 'order-1',
        tenantId: undefined,
        status: 'PAID',
        refundInfo: null,
        lines: [],
      };
      mutator(draft);
      return draft;
    };

    await OrderService.refund({
      id: 'order-1',
      by: {
        id: 'employee-2',
        firstName: 'Test',
        lastName: 'Cashier',
      } as any,
      order: {
        id: 'order-1',
        orderNo: '51-25-260316-0001',
        subtotal: 10,
        tax: 0,
        total: 10,
        status: 'PAID',
        employeeId: 'employee-1',
        employeeName: 'Test Cashier',
        orderDate: '2026-03-16T12:00:00.000Z',
        lines: [
          {
            identifier: 'line-1',
            productId: 'product-1',
            productName: 'Rice',
            quantity: 2,
            price: 5,
            unitOfMeasure: 'LB',
            barcode: null,
            sku: null,
          },
        ],
      } as any,
      refundedLines: [{ identifier: 'line-1', quantity: 1 }],
    });

    expect(saveMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        id: 'order-1',
        tenantId: 'test-tenant',
        status: 'PARTIALLY_REFUNDED',
      })
    );
    expect(saveMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        refundId: 'generated-order-id',
        orderId: 'order-1',
        orderLineIdentifier: 'line-1',
        quantityRefunded: 1,
        lineRefundAmount: 5,
      })
    );
    expect(saveMock).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        id: 'generated-order-id',
        orderId: 'order-1',
        orderNo: '51-25-260316-0001',
        refundType: 'PARTIAL',
        status: 'COMPLETED',
        inventoryApplyState: 'PENDING',
        inventoryApplyOperationId: 'ORDER_REFUND:order-1:generated-order-id',
      })
    );
  });

  it('uses the latest remote order version when persisting a refund status change', async () => {
    const queryMock = jest.mocked(DataStore.query);
    const saveMock = jest.mocked(DataStore.save);
    const graphqlMock = jest.mocked(API.graphql);

    queryMock.mockResolvedValueOnce({
      id: 'order-remote',
      tenantId: 'test-tenant',
      status: 'PAID',
      employeeId: 'employee-1',
      orderNo: '51-25-260316-0091',
      subtotal: 10,
      tax: 0,
      total: 10,
      lines: [
        {
          identifier: 'line-1',
          productId: 'product-1',
          productName: 'Rice',
          quantity: 2,
          price: 5,
          unitOfMeasure: 'EA',
          barcode: null,
          sku: null,
          lineTotalBeforeTax: 10,
        },
      ],
      orderDate: '2026-03-16T12:00:00.000Z',
      createdAt: '2026-03-16T12:00:00.000Z',
      updatedAt: '2026-03-16T12:00:00.000Z',
    } as any);
    queryMock.mockResolvedValueOnce([]);

    graphqlMock
      .mockResolvedValueOnce({
        data: {
          getOrder: {
            id: 'order-remote',
            tenantId: 'test-tenant',
            status: 'PAID',
            _version: 7,
          },
        },
      } as any)
      .mockResolvedValueOnce({
        data: {
          updateOrder: {
            id: 'order-remote',
            tenantId: 'test-tenant',
            status: 'PARTIALLY_REFUNDED',
          },
        },
      } as any);

    await OrderService.refund({
      id: 'order-remote',
      by: {
        id: 'employee-2',
        firstName: 'Refund',
        lastName: 'Cashier',
      } as any,
      order: {
        id: 'order-remote',
        orderNo: '51-25-260316-0091',
        subtotal: 10,
        tax: 0,
        total: 10,
        status: 'PAID',
        employeeId: 'employee-1',
        employeeName: 'Original Cashier',
        orderDate: '2026-03-16T12:00:00.000Z',
        lines: [
          {
            identifier: 'line-1',
            quantity: 2,
            productId: 'product-1',
            productName: 'Rice',
            price: 5,
            unitOfMeasure: 'EA',
            barcode: null,
            sku: null,
            lineTotalBeforeTax: 10,
          },
        ],
      } as any,
      refundedLines: [{ identifier: 'line-1', quantity: 1 }],
    });

    expect(graphqlMock).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.stringContaining('query GetOrder'),
        variables: { id: 'order-remote' },
        authMode: 'userPool',
      })
    );
    expect(graphqlMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        query: expect.stringContaining('mutation UpdateOrder'),
        variables: {
          input: expect.objectContaining({
            id: 'order-remote',
            tenantId: 'test-tenant',
            status: 'PARTIALLY_REFUNDED',
            _version: 7,
          }),
        },
        authMode: 'userPool',
      })
    );
    expect(saveMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        refundId: 'generated-order-id',
        orderId: 'order-remote',
      })
    );
    expect(saveMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        id: 'generated-order-id',
        orderId: 'order-remote',
        refundType: 'PARTIAL',
      })
    );
    expect(saveMock).toHaveBeenCalledTimes(2);
  });

  it('preserves discounted refund amounts when creating a partial refund record', async () => {
    const queryMock = jest.mocked(DataStore.query);
    const saveMock = jest.mocked(DataStore.save);
    const sharedModels = jest.requireMock('@pos/shared/models');

    queryMock.mockResolvedValueOnce({
      id: 'order-2',
      tenantId: 'test-tenant',
      status: 'PAID',
      employeeId: 'employee-1',
      orderNo: '51-25-260316-0002',
      baseSubtotal: 20,
      subtotal: 15,
      lineDiscountTotal: 2,
      orderDiscountTotal: 3,
      discountTotal: 5,
      savingsTotal: 5,
      tax: 0,
      total: 15,
      lines: [
        {
          identifier: 'line-1',
          productId: 'product-1',
          productName: 'Rice',
          quantity: 2,
          price: 10,
          basePrice: 10,
          unitOfMeasure: 'EA',
          barcode: null,
          sku: null,
          lineDiscountTotal: 2,
          allocatedOrderDiscountTotal: 3,
          lineTotalBeforeTax: 15,
        },
      ],
      promoCodes: ['SAVE5'],
      orderDate: '2026-03-16T12:00:00.000Z',
      createdAt: '2026-03-16T12:00:00.000Z',
      updatedAt: '2026-03-16T12:00:00.000Z',
    } as any);
    queryMock.mockResolvedValueOnce([]);

    (sharedModels.Order as any).copyOf = (existing: any, mutator: (draft: any) => void) => {
      const draft = {
        ...existing,
        refundInfo: null,
      };
      mutator(draft);
      return draft;
    };

    await OrderService.refund({
      id: 'order-2',
      by: {
        id: 'employee-2',
        firstName: 'Refund',
        lastName: 'Cashier',
      } as any,
      order: {
        id: 'order-2',
        orderNo: '51-25-260316-0002',
        subtotal: 15,
        tax: 0,
        total: 15,
        status: 'PAID',
        employeeId: 'employee-1',
        employeeName: 'Original Cashier',
        orderDate: '2026-04-18T00:00:00.000Z',
        lines: [
          {
            identifier: 'line-1',
            quantity: 2,
            productId: 'product-1',
            productName: 'Rice',
            price: 10,
            basePrice: 10,
            unitOfMeasure: 'EA',
            barcode: null,
            sku: null,
            lineDiscountTotal: 2,
            allocatedOrderDiscountTotal: 3,
            lineTotalBeforeTax: 15,
          },
        ],
      } as any,
      refundedLines: [{ identifier: 'line-1', quantity: 1 }],
    });

    expect(saveMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        refundId: 'generated-order-id',
        unitRefundAmount: 7.5,
        lineRefundAmount: 7.5,
      })
    );
    expect(saveMock).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        id: 'generated-order-id',
        refundAmount: 7.5,
        refundType: 'PARTIAL',
        inventoryApplyOperationId: 'ORDER_REFUND:order-2:generated-order-id',
      })
    );
  });

  it('uses the generated refund id for refund lines and inventory operation metadata', async () => {
    const queryMock = jest.mocked(DataStore.query);
    const saveMock = jest.mocked(DataStore.save);
    const sharedModels = jest.requireMock('@pos/shared/models');

    queryMock.mockResolvedValueOnce({
      id: 'order-5',
      tenantId: 'test-tenant',
      status: 'PAID',
      employeeId: 'employee-1',
      orderNo: '51-25-260316-0005',
      subtotal: 10,
      tax: 0,
      total: 10,
      lines: [
        {
          identifier: 'line-1',
          productId: 'product-1',
          productName: 'Rice',
          quantity: 2,
          price: 5,
          unitOfMeasure: 'EA',
          barcode: null,
          sku: null,
          lineTotalBeforeTax: 10,
        },
      ],
      orderDate: '2026-03-16T12:00:00.000Z',
      createdAt: '2026-03-16T12:00:00.000Z',
      updatedAt: '2026-03-16T12:00:00.000Z',
    } as any);
    queryMock.mockResolvedValueOnce([]);

    (sharedModels.Order as any).copyOf = (existing: any, mutator: (draft: any) => void) => {
      const draft = {
        ...existing,
        refundInfo: null,
      };
      mutator(draft);
      return draft;
    };

    await OrderService.refund({
      id: 'order-5',
      by: {
        id: 'employee-2',
        firstName: 'Refund',
        lastName: 'Cashier',
      } as any,
      order: {
        id: 'order-5',
        orderNo: '51-25-260316-0005',
        subtotal: 10,
        tax: 0,
        total: 10,
        status: 'PAID',
        employeeId: 'employee-1',
        employeeName: 'Original Cashier',
        orderDate: '2026-03-16T12:00:00.000Z',
        lines: [
          {
            identifier: 'line-1',
            quantity: 2,
            productId: 'product-1',
            productName: 'Rice',
            price: 5,
            unitOfMeasure: 'EA',
            barcode: null,
            sku: null,
            lineTotalBeforeTax: 10,
          },
        ],
      } as any,
      refundedLines: [{ identifier: 'line-1', quantity: 1 }],
    });

    expect(saveMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        refundId: 'generated-order-id',
        orderId: 'order-5',
      })
    );
    expect(saveMock).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        id: 'generated-order-id',
        inventoryApplyOperationId: 'ORDER_REFUND:order-5:generated-order-id',
      })
    );
  });

  it('persists explicit refund payment breakdowns on the refund record', async () => {
    const queryMock = jest.mocked(DataStore.query);
    const saveMock = jest.mocked(DataStore.save);
    const sharedModels = jest.requireMock('@pos/shared/models');

    queryMock.mockResolvedValueOnce({
      id: 'order-6',
      tenantId: 'test-tenant',
      status: 'PAID',
      employeeId: 'employee-1',
      orderNo: '51-25-260316-0006',
      subtotal: 20,
      tax: 0,
      total: 20,
      paymentInfo: {
        payments: [
          { type: 'CC', amount: 12 },
          { type: 'CASH', amount: 8 },
        ],
      },
      lines: [
        {
          identifier: 'line-1',
          productId: 'product-1',
          productName: 'Rice',
          quantity: 2,
          price: 10,
          unitOfMeasure: 'EA',
          lineTotalBeforeTax: 20,
        },
      ],
      orderDate: '2026-03-16T12:00:00.000Z',
    } as any);
    queryMock.mockResolvedValueOnce([]);

    (sharedModels.Order as any).copyOf = (existing: any, mutator: (draft: any) => void) => {
      const draft = {
        ...existing,
        refundInfo: null,
      };
      mutator(draft);
      return draft;
    };

    await OrderService.refund({
      id: 'order-6',
      by: {
        id: 'employee-2',
        firstName: 'Refund',
        lastName: 'Cashier',
      } as any,
      order: {
        id: 'order-6',
        orderNo: '51-25-260316-0006',
        subtotal: 20,
        tax: 0,
        total: 20,
        status: 'PAID',
        paymentInfo: {
          payments: [
            { type: 'CC', amount: 12 },
            { type: 'CASH', amount: 8 },
          ],
        },
        lines: [
          {
            identifier: 'line-1',
            quantity: 2,
            productId: 'product-1',
            productName: 'Rice',
            price: 10,
            unitOfMeasure: 'EA',
            lineTotalBeforeTax: 20,
          },
        ],
      } as any,
      refundedLines: [{ identifier: 'line-1', quantity: 1 }],
      refundPayments: [
        { type: 'CC', amount: 6 },
        { type: 'CASH', amount: 4 },
      ],
    });

    expect(saveMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        status: 'PARTIALLY_REFUNDED',
        currentSubtotal: 10,
        currentDiscountTotal: 0,
        currentTax: 0,
        currentTotal: 10,
      })
    );
    expect(saveMock).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        id: 'generated-order-id',
        refundAmount: 10,
        refundPayments: [
          { type: 'CC', amount: 6 },
          { type: 'CASH', amount: 4 },
        ],
      })
    );
  });

  it('rejects refund payment breakdowns that do not match the refund total', async () => {
    const queryMock = jest.mocked(DataStore.query);

    queryMock.mockResolvedValueOnce({
      id: 'order-7',
      tenantId: 'test-tenant',
      status: 'PAID',
      employeeId: 'employee-1',
      orderNo: '51-25-260316-0007',
      subtotal: 20,
      tax: 0,
      total: 20,
      lines: [
        {
          identifier: 'line-1',
          productId: 'product-1',
          productName: 'Rice',
          quantity: 2,
          price: 10,
          unitOfMeasure: 'EA',
          lineTotalBeforeTax: 20,
        },
      ],
      orderDate: '2026-03-16T12:00:00.000Z',
    } as any);
    queryMock.mockResolvedValueOnce([]);

    await expect(
      OrderService.refund({
        id: 'order-7',
        by: {
          id: 'employee-2',
          firstName: 'Refund',
          lastName: 'Cashier',
        } as any,
        order: {
          id: 'order-7',
          orderNo: '51-25-260316-0007',
          subtotal: 20,
          tax: 0,
          total: 20,
          status: 'PAID',
          lines: [
            {
              identifier: 'line-1',
              quantity: 2,
              productId: 'product-1',
              productName: 'Rice',
              price: 10,
              unitOfMeasure: 'EA',
              lineTotalBeforeTax: 20,
            },
          ],
        } as any,
        refundedLines: [{ identifier: 'line-1', quantity: 1 }],
        refundPayments: [{ type: 'CC', amount: 3 }],
      })
    ).rejects.toThrow(
      'Refund payment methods must add up to 10.00'
    );
  });

  it('recalculates automatic discount refunds when the remaining quantity no longer qualifies', async () => {
    const queryMock = jest.mocked(DataStore.query);
    const saveMock = jest.mocked(DataStore.save);
    const sharedModels = jest.requireMock('@pos/shared/models');

    const automaticSummary = {
      applications: [
        {
          discountApplicationId: 'discount-1-line-1',
          discountDefinitionId: 'discount-1',
          orderDiscountSnapshotId: 'order-huevo:discount-1',
          applicationType: 'AUTOMATIC_DISCOUNT',
          scope: 'LINE',
          method: 'PERCENT',
          name: 'Test 1%',
          code: null,
          stackMode: 'STACKABLE',
          source: 'automatic',
          value: 30,
          originalAmount: 14.97,
          discountAmount: 4.49,
          finalAmount: 10.48,
          quantityBasis: 3,
          approvalRequired: false,
          approvalStatus: 'NOT_REQUIRED',
          appliedAt: '2026-04-19T12:00:00.000Z',
        },
      ],
      approvalEvents: [],
      lineSummaries: [
        {
          lineId: 'line-1',
          discounts: [
            {
              discountApplicationId: 'discount-1-line-1',
              discountDefinitionId: 'discount-1',
              orderDiscountSnapshotId: 'order-huevo:discount-1',
              applicationType: 'AUTOMATIC_DISCOUNT',
              scope: 'LINE',
              method: 'PERCENT',
              name: 'Test 1%',
              code: null,
              stackMode: 'STACKABLE',
              source: 'automatic',
              value: 30,
              originalAmount: 14.97,
              discountAmount: 4.49,
              finalAmount: 10.48,
              quantityBasis: 3,
              approvalRequired: false,
              approvalStatus: 'NOT_REQUIRED',
              appliedAt: '2026-04-19T12:00:00.000Z',
            },
          ],
          lineDiscountTotal: 4.49,
          allocatedOrderDiscountTotal: 0,
          lineTotalBeforeTax: 10.48,
        },
      ],
      orderLevelAdjustments: [],
      warnings: [],
      pricingGeneratedAt: '2026-04-19T12:00:00.000Z',
    };

    queryMock.mockImplementation(async (model: any, arg?: any) => {
      if (model === sharedModels.Order && arg === 'order-huevo') {
        return {
          id: 'order-huevo',
          tenantId: 'test-tenant',
          status: 'PAID',
          employeeId: 'employee-1',
          employeeName: 'Original Cashier',
          orderNo: '51-OWNER-260419-0001',
          baseSubtotal: 14.97,
          subtotal: 10.48,
          lineDiscountTotal: 4.49,
          orderDiscountTotal: 0,
          discountTotal: 4.49,
          savingsTotal: 4.49,
          tax: 0,
          total: 10.48,
          pricingSource: 'OFFLINE_LOCAL',
          reconciliationStatus: 'PENDING',
          appliedDiscountSummary: automaticSummary,
          promoCodes: [],
          lines: [
            {
              identifier: 'line-1',
              productId: 'huevo',
              productName: 'Huevo',
              quantity: 3,
              price: 4.99,
              basePrice: 4.99,
              unitOfMeasure: 'EA',
              barcode: null,
              sku: null,
              categoryId: 'cat-1',
              discountable: true,
              lineDiscountTotal: 4.49,
              allocatedOrderDiscountTotal: 0,
              lineTotalBeforeTax: 10.48,
              lineTotalAfterTax: 10.48,
              appliedDiscounts: automaticSummary.lineSummaries[0].discounts,
            },
          ],
          orderDate: '2026-04-19T12:00:00.000Z',
          createdAt: '2026-04-19T12:00:00.000Z',
          updatedAt: '2026-04-19T12:00:00.000Z',
        } as any;
      }

      if (model === sharedModels.OrderRefundLine) {
        return [];
      }

      if (model === sharedModels.OrderDiscountDefinitionSnapshot) {
        return [
          {
            id: 'order-huevo:discount-1',
            orderId: 'order-huevo',
            discountDefinitionId: 'discount-1',
            tenantId: 'test-tenant',
            name: 'Test 1%',
            status: 'ACTIVE',
            type: 'AUTOMATIC',
            method: 'PERCENT',
            scope: 'LINE',
            value: 30,
            stackMode: 'STACKABLE',
            minSubtotal: 12,
            applicableProductIds: ['huevo'],
            appliesToAllProducts: false,
            pricingGeneratedAt: '2026-04-19T12:00:00.000Z',
            pricingTimezone: 'America/New_York',
            pricingStationId: '51',
          },
          {
            id: 'order-huevo:discount-unrelated',
            orderId: 'order-huevo',
            discountDefinitionId: 'discount-unrelated',
            tenantId: 'test-tenant',
            name: 'Unrelated live-looking deal',
            status: 'ACTIVE',
            type: 'AUTOMATIC',
            method: 'PERCENT',
            scope: 'LINE',
            value: 90,
            stackMode: 'STACKABLE',
            applicableProductIds: ['other-product'],
            appliesToAllProducts: false,
            pricingGeneratedAt: '2026-04-19T12:00:00.000Z',
            pricingTimezone: 'America/New_York',
            pricingStationId: '51',
          },
        ] as any;
      }

      if (model === sharedModels.OrderRefund) {
        return [];
      }

      return [];
    });

    (sharedModels.Order as any).copyOf = (existing: any, mutator: (draft: any) => void) => {
      const draft = {
        ...existing,
        refundInfo: null,
      };
      mutator(draft);
      return draft;
    };

    await OrderService.refund({
      id: 'order-huevo',
      by: {
        id: 'employee-2',
        firstName: 'Refund',
        lastName: 'Cashier',
      } as any,
      order: {
        id: 'order-huevo',
        orderNo: '51-OWNER-260419-0001',
        baseSubtotal: 14.97,
        subtotal: 10.48,
        total: 10.48,
        status: 'PAID',
        employeeId: 'employee-1',
        employeeName: 'Original Cashier',
        pricingSource: 'OFFLINE_LOCAL',
        reconciliationStatus: 'PENDING',
        appliedDiscountSummary: automaticSummary,
        lines: [
          {
            identifier: 'line-1',
            quantity: 3,
            productId: 'huevo',
            productName: 'Huevo',
            price: 4.99,
            basePrice: 4.99,
            unitOfMeasure: 'EA',
            categoryId: 'cat-1',
            barcode: null,
            sku: null,
            discountable: true,
            lineDiscountTotal: 4.49,
            allocatedOrderDiscountTotal: 0,
            lineTotalBeforeTax: 10.48,
            lineTotalAfterTax: 10.48,
            appliedDiscounts: automaticSummary.lineSummaries[0].discounts,
          },
        ],
        orderDate: '2026-04-19T12:00:00.000Z',
      } as any,
      refundedLines: [{ identifier: 'line-1', quantity: 2 }],
    });

    expect(saveMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        refundId: 'generated-order-id',
        quantityRefunded: 2,
        lineRefundAmount: 5.49,
      })
    );
    expect(saveMock).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        id: 'generated-order-id',
        refundAmount: 5.49,
        refundType: 'PARTIAL',
      })
    );
    expect(queryMock).not.toHaveBeenCalledWith(
      sharedModels.DiscountDefinition,
      expect.anything()
    );
  });

  it('previews the recalculated refund amount for threshold discounts', async () => {
    const queryMock = jest.mocked(DataStore.query);
    const sharedModels = jest.requireMock('@pos/shared/models');

    const automaticSummary = {
      applications: [
        {
          discountApplicationId: 'discount-1-line-1',
          discountDefinitionId: 'discount-1',
          orderDiscountSnapshotId: 'order-huevo:discount-1',
          applicationType: 'AUTOMATIC_DISCOUNT',
          scope: 'LINE',
          method: 'PERCENT',
          name: 'Test 1%',
          code: null,
          stackMode: 'STACKABLE',
          source: 'automatic',
          value: 30,
          originalAmount: 14.97,
          discountAmount: 4.49,
          finalAmount: 10.48,
          quantityBasis: 3,
          approvalRequired: false,
          approvalStatus: 'NOT_REQUIRED',
          appliedAt: '2026-04-19T12:00:00.000Z',
        },
      ],
      approvalEvents: [],
      lineSummaries: [
        {
          lineId: 'line-1',
          discounts: [
            {
              discountApplicationId: 'discount-1-line-1',
              discountDefinitionId: 'discount-1',
              orderDiscountSnapshotId: 'order-huevo:discount-1',
              applicationType: 'AUTOMATIC_DISCOUNT',
              scope: 'LINE',
              method: 'PERCENT',
              name: 'Test 1%',
              code: null,
              stackMode: 'STACKABLE',
              source: 'automatic',
              value: 30,
              originalAmount: 14.97,
              discountAmount: 4.49,
              finalAmount: 10.48,
              quantityBasis: 3,
              approvalRequired: false,
              approvalStatus: 'NOT_REQUIRED',
              appliedAt: '2026-04-19T12:00:00.000Z',
            },
          ],
          lineDiscountTotal: 4.49,
          allocatedOrderDiscountTotal: 0,
          lineTotalBeforeTax: 10.48,
        },
      ],
      orderLevelAdjustments: [],
      warnings: [],
      pricingGeneratedAt: '2026-04-19T12:00:00.000Z',
    };

    queryMock.mockImplementation(async (model: any, arg?: any) => {
      if (model === sharedModels.Order && arg === 'order-huevo') {
        return {
          id: 'order-huevo',
          tenantId: 'test-tenant',
          status: 'PAID',
          employeeId: 'employee-1',
          employeeName: 'Original Cashier',
          orderNo: '51-OWNER-260419-0001',
          baseSubtotal: 14.97,
          subtotal: 10.48,
          lineDiscountTotal: 4.49,
          orderDiscountTotal: 0,
          discountTotal: 4.49,
          savingsTotal: 4.49,
          tax: 0,
          total: 10.48,
          pricingSource: 'OFFLINE_LOCAL',
          reconciliationStatus: 'PENDING',
          appliedDiscountSummary: automaticSummary,
          promoCodes: [],
          lines: [
            {
              identifier: 'line-1',
              productId: 'huevo',
              productName: 'Huevo',
              quantity: 3,
              price: 4.99,
              basePrice: 4.99,
              unitOfMeasure: 'EA',
              barcode: null,
              sku: null,
              categoryId: 'cat-1',
              discountable: true,
              lineDiscountTotal: 4.49,
              allocatedOrderDiscountTotal: 0,
              lineTotalBeforeTax: 10.48,
              lineTotalAfterTax: 10.48,
              appliedDiscounts: automaticSummary.lineSummaries[0].discounts,
            },
          ],
          orderDate: '2026-04-19T12:00:00.000Z',
          createdAt: '2026-04-19T12:00:00.000Z',
          updatedAt: '2026-04-19T12:00:00.000Z',
        } as any;
      }

      if (model === sharedModels.OrderRefundLine) {
        return [];
      }

      if (model === sharedModels.OrderDiscountDefinitionSnapshot) {
        return [
          {
            id: 'order-huevo:discount-1',
            orderId: 'order-huevo',
            discountDefinitionId: 'discount-1',
            tenantId: 'test-tenant',
            name: 'Test 1%',
            status: 'ACTIVE',
            type: 'AUTOMATIC',
            method: 'PERCENT',
            scope: 'LINE',
            value: 30,
            stackMode: 'STACKABLE',
            minSubtotal: 12,
            applicableProductIds: ['huevo'],
            appliesToAllProducts: false,
            pricingGeneratedAt: '2026-04-19T12:00:00.000Z',
            pricingTimezone: 'America/New_York',
            pricingStationId: '51',
          },
        ] as any;
      }

      if (model === sharedModels.OrderRefund) {
        return [];
      }

      return [];
    });

    const preview = await OrderService.previewRefund({
      id: 'order-huevo',
      order: {
        id: 'order-huevo',
        orderNo: '51-OWNER-260419-0001',
        baseSubtotal: 14.97,
        subtotal: 10.48,
        total: 10.48,
        status: 'PAID',
        employeeId: 'employee-1',
        employeeName: 'Original Cashier',
        pricingSource: 'OFFLINE_LOCAL',
        reconciliationStatus: 'PENDING',
        appliedDiscountSummary: automaticSummary,
        lines: [
          {
            identifier: 'line-1',
            quantity: 3,
            productId: 'huevo',
            productName: 'Huevo',
            price: 4.99,
            basePrice: 4.99,
            unitOfMeasure: 'EA',
            categoryId: 'cat-1',
            barcode: null,
            sku: null,
            discountable: true,
            lineDiscountTotal: 4.49,
            allocatedOrderDiscountTotal: 0,
            lineTotalBeforeTax: 10.48,
            lineTotalAfterTax: 10.48,
            appliedDiscounts: automaticSummary.lineSummaries[0].discounts,
          },
        ],
        orderDate: '2026-04-19T12:00:00.000Z',
      } as any,
      refundedLines: [{ identifier: 'line-1', quantity: 2 }],
    });

    expect(preview).toEqual({
      refundTotal: 5.49,
      newTotal: 4.99,
    });
  });

  it('builds partial-refund tickets from the repriced active basket and keeps refunded rows informational only', async () => {
    const queryMock = jest.mocked(DataStore.query);
    const sharedModels = jest.requireMock('@pos/shared/models');

    const automaticSummary = {
      applications: [
        {
          discountApplicationId: 'discount-1-line-1',
          discountDefinitionId: 'discount-1',
          orderDiscountSnapshotId: 'order-huevo-ticket:discount-1',
          applicationType: 'AUTOMATIC_DISCOUNT',
          scope: 'LINE',
          method: 'PERCENT',
          name: 'Test 1%',
          code: null,
          stackMode: 'STACKABLE',
          source: 'automatic',
          value: 30,
          originalAmount: 14.97,
          discountAmount: 4.49,
          finalAmount: 10.48,
          quantityBasis: 3,
          approvalRequired: false,
          approvalStatus: 'NOT_REQUIRED',
          appliedAt: '2026-04-19T12:00:00.000Z',
        },
      ],
      approvalEvents: [],
      lineSummaries: [
        {
          lineId: 'line-1',
          discounts: [
            {
              discountApplicationId: 'discount-1-line-1',
              discountDefinitionId: 'discount-1',
              orderDiscountSnapshotId: 'order-huevo-ticket:discount-1',
              applicationType: 'AUTOMATIC_DISCOUNT',
              scope: 'LINE',
              method: 'PERCENT',
              name: 'Test 1%',
              code: null,
              stackMode: 'STACKABLE',
              source: 'automatic',
              value: 30,
              originalAmount: 14.97,
              discountAmount: 4.49,
              finalAmount: 10.48,
              quantityBasis: 3,
              approvalRequired: false,
              approvalStatus: 'NOT_REQUIRED',
              appliedAt: '2026-04-19T12:00:00.000Z',
            },
          ],
          lineDiscountTotal: 4.49,
          allocatedOrderDiscountTotal: 0,
          lineTotalBeforeTax: 10.48,
        },
      ],
      orderLevelAdjustments: [],
      warnings: [],
      pricingGeneratedAt: '2026-04-19T12:00:00.000Z',
    };

    queryMock.mockImplementation(async (model: any, arg?: any) => {
      if (model === sharedModels.Order && arg === 'order-huevo-ticket') {
        return {
          id: 'order-huevo-ticket',
          tenantId: 'test-tenant',
          status: 'PARTIALLY_REFUNDED',
          employeeId: 'employee-1',
          employeeName: 'Original Cashier',
          orderNo: '51-OWNER-260419-0002',
          baseSubtotal: 14.97,
          subtotal: 10.48,
          lineDiscountTotal: 4.49,
          orderDiscountTotal: 0,
          discountTotal: 4.49,
          savingsTotal: 4.49,
          tax: 0,
          total: 10.48,
          currentSubtotal: 4.99,
          currentDiscountTotal: 0,
          currentTax: 0,
          currentTotal: 4.99,
          pricingSource: 'OFFLINE_LOCAL',
          reconciliationStatus: 'PENDING',
          appliedDiscountSummary: automaticSummary,
          paymentInfo: {
            payments: [{ type: 'CC', amount: 10.48 }],
          },
          promoCodes: [],
          lines: [
            {
              identifier: 'line-1',
              productId: 'huevo',
              productName: 'Huevo',
              quantity: 3,
              price: 4.99,
              basePrice: 4.99,
              unitOfMeasure: 'EA',
              barcode: null,
              sku: null,
              categoryId: 'cat-1',
              discountable: true,
              lineDiscountTotal: 4.49,
              allocatedOrderDiscountTotal: 0,
              lineTotalBeforeTax: 10.48,
              lineTotalAfterTax: 10.48,
              appliedDiscounts: automaticSummary.lineSummaries[0].discounts,
            },
          ],
          orderDate: '2026-04-19T12:00:00.000Z',
          createdAt: '2026-04-19T12:00:00.000Z',
          updatedAt: '2026-04-19T12:00:00.000Z',
        } as any;
      }

      if (model === sharedModels.OrderRefundLine) {
        return [
          {
            id: 'refund-line-1',
            orderId: 'order-huevo-ticket',
            orderLineIdentifier: 'line-1',
            quantityRefunded: 2,
            lineRefundAmount: 5.49,
          },
        ] as any;
      }

      if (model === sharedModels.OrderRefund) {
        return [
          {
            id: 'refund-1',
            orderId: 'order-huevo-ticket',
            refundAmount: 5.49,
            refundPayments: [{ type: 'CC', amount: 5.49 }],
          },
        ] as any;
      }

      if (model === sharedModels.OrderDiscountDefinitionSnapshot) {
        return [
          {
            id: 'order-huevo-ticket:discount-1',
            orderId: 'order-huevo-ticket',
            discountDefinitionId: 'discount-1',
            tenantId: 'test-tenant',
            name: 'Test 1%',
            status: 'ACTIVE',
            type: 'AUTOMATIC',
            method: 'PERCENT',
            scope: 'LINE',
            value: 30,
            stackMode: 'STACKABLE',
            minSubtotal: 12,
            applicableProductIds: ['huevo'],
            appliesToAllProducts: false,
            pricingGeneratedAt: '2026-04-19T12:00:00.000Z',
            pricingTimezone: 'America/New_York',
            pricingStationId: '51',
          },
        ] as any;
      }

      return [];
    });

    const ticket = await OrderService.buildPrintTicketForOrder('order-huevo-ticket', {
      copyType: 'CUSTOMER',
    });

    expect(ticket.copyType).toBe('CUSTOMER');
    expect(ticket.sections[0]).toEqual({
      title: 'Active Items',
      emptyLabel: 'No active items',
      rows: [
        {
          identifier: 'line-1',
          quantity: 1,
          name: 'Huevo',
          amount: 4.99,
          detailRows: [],
        },
      ],
    });
    expect(ticket.sections[1]).toEqual({
      title: 'Refunded Items',
      emptyLabel: 'No refunded items',
      rows: [
        {
          identifier: 'line-1',
          quantity: 2,
          name: 'Huevo',
          amount: 5.49,
          detailRows: [],
        },
      ],
    });
    expect(ticket.totals).toEqual({
      subtotal: 4.99,
      discount: 0,
      tax: 0,
      total: 4.99,
    });
    expect(ticket.paymentRows).toEqual([
      { kind: 'heading', label: 'Original Payments' },
      { kind: 'payment', label: 'CC', amount: 10.48 },
      { kind: 'heading', label: 'Refund Payments' },
      { kind: 'payment', label: 'CC', amount: -5.49 },
    ]);
  });

  it('uses the current open balance for additional refunds when no applied discount snapshots exist', async () => {
    const queryMock = jest.mocked(DataStore.query);
    const sharedModels = jest.requireMock('@pos/shared/models');

    queryMock.mockImplementation(async (model: any, arg?: any) => {
      if (model === sharedModels.Order && arg === 'order-current-balance') {
        return {
          id: 'order-current-balance',
          tenantId: 'test-tenant',
          status: 'PARTIALLY_REFUNDED',
          employeeId: 'employee-1',
          employeeName: 'Original Cashier',
          orderNo: '1-OWNER-260420-0003',
          subtotal: 110.97,
          tax: 0,
          total: 110.97,
          lines: [
            {
              identifier: 'line-1',
              productId: 'oil-1',
              productName: 'Aceite cubt35 lb',
              quantity: 1,
              price: 39.99,
              unitOfMeasure: 'EA',
              barcode: null,
              sku: null,
              lineTotalBeforeTax: 39.99,
            },
            {
              identifier: 'line-2',
              productId: 'oil-2',
              productName: 'Aceite vegetal',
              quantity: 1,
              price: 24.99,
              unitOfMeasure: 'EA',
              barcode: null,
              sku: null,
              lineTotalBeforeTax: 24.99,
            },
            {
              identifier: 'line-3',
              productId: 'lard-1',
              productName: 'Manteca de cerdo [25 lb]',
              quantity: 1,
              price: 45.99,
              unitOfMeasure: 'EA',
              barcode: null,
              sku: null,
              lineTotalBeforeTax: 45.99,
            },
          ],
          orderDate: '2026-04-20T12:00:00.000Z',
          createdAt: '2026-04-20T12:00:00.000Z',
          updatedAt: '2026-04-20T12:00:00.000Z',
        } as any;
      }

      if (model === sharedModels.OrderRefundLine) {
        return [
          {
            id: 'refund-line-1',
            orderId: 'order-current-balance',
            orderLineIdentifier: 'line-2',
            quantityRefunded: 1,
          },
          {
            id: 'refund-line-2',
            orderId: 'order-current-balance',
            orderLineIdentifier: 'line-3',
            quantityRefunded: 1,
          },
        ] as any;
      }

      if (model === sharedModels.OrderRefund) {
        return [
          {
            id: 'refund-1',
            orderId: 'order-current-balance',
            refundAmount: 24.99,
          },
          {
            id: 'refund-2',
            orderId: 'order-current-balance',
            refundAmount: 45.99,
          },
        ] as any;
      }

      if (model === sharedModels.OrderDiscountDefinitionSnapshot) {
        return [] as any;
      }

      return [];
    });

    const preview = await OrderService.previewRefund({
      id: 'order-current-balance',
      order: {
        id: 'order-current-balance',
        orderNo: '1-OWNER-260420-0003',
        subtotal: 110.97,
        tax: 0,
        total: 110.97,
        status: 'PARTIALLY_REFUNDED',
        employeeId: 'employee-1',
        employeeName: 'Original Cashier',
        lines: [
          {
            identifier: 'line-1',
            quantity: 1,
            productId: 'oil-1',
            productName: 'Aceite cubt35 lb',
            price: 39.99,
            unitOfMeasure: 'EA',
            barcode: null,
            sku: null,
            lineTotalBeforeTax: 39.99,
          },
          {
            identifier: 'line-2',
            quantity: 1,
            productId: 'oil-2',
            productName: 'Aceite vegetal',
            price: 24.99,
            unitOfMeasure: 'EA',
            barcode: null,
            sku: null,
            lineTotalBeforeTax: 24.99,
          },
          {
            identifier: 'line-3',
            quantity: 1,
            productId: 'lard-1',
            productName: 'Manteca de cerdo [25 lb]',
            price: 45.99,
            unitOfMeasure: 'EA',
            barcode: null,
            sku: null,
            lineTotalBeforeTax: 45.99,
          },
        ],
        orderDate: '2026-04-20T12:00:00.000Z',
      } as any,
      refundedLines: [{ identifier: 'line-1', quantity: 1 }],
    });

    expect(preview).toEqual({
      refundTotal: 39.99,
      newTotal: 0,
    });
  });


  it('marks an order fully refunded when the last refundable quantity is returned', async () => {
    const queryMock = jest.mocked(DataStore.query);
    const saveMock = jest.mocked(DataStore.save);
    const sharedModels = jest.requireMock('@pos/shared/models');

    queryMock.mockResolvedValueOnce({
      id: 'order-3',
      tenantId: 'test-tenant',
      status: 'PARTIALLY_REFUNDED',
      employeeId: 'employee-1',
      orderNo: '51-25-260316-0003',
      subtotal: 10,
      tax: 0,
      total: 10,
      lines: [
        {
          identifier: 'line-1',
          productId: 'product-1',
          productName: 'Rice',
          quantity: 2,
          price: 5,
          unitOfMeasure: 'EA',
          barcode: null,
          sku: null,
          lineTotalBeforeTax: 10,
        },
      ],
      orderDate: '2026-03-16T12:00:00.000Z',
      createdAt: '2026-03-16T12:00:00.000Z',
      updatedAt: '2026-03-16T12:00:00.000Z',
    } as any);
    queryMock.mockResolvedValueOnce([
      {
        id: 'refund-line-1',
        orderId: 'order-3',
        orderLineIdentifier: 'line-1',
        quantityRefunded: 1,
      },
    ] as any);

    (sharedModels.Order as any).copyOf = (existing: any, mutator: (draft: any) => void) => {
      const draft = {
        ...existing,
        refundInfo: null,
      };
      mutator(draft);
      return draft;
    };

    await OrderService.refund({
      id: 'order-3',
      by: {
        id: 'employee-2',
        firstName: 'Refund',
        lastName: 'Cashier',
      } as any,
      order: {
        id: 'order-3',
        orderNo: '51-25-260316-0003',
        subtotal: 10,
        tax: 0,
        total: 10,
        status: 'PARTIALLY_REFUNDED',
        employeeId: 'employee-1',
        employeeName: 'Original Cashier',
        orderDate: '2026-03-16T12:00:00.000Z',
        lines: [
          {
            identifier: 'line-1',
            quantity: 2,
            productId: 'product-1',
            productName: 'Rice',
            price: 5,
            unitOfMeasure: 'EA',
            barcode: null,
            sku: null,
            lineTotalBeforeTax: 10,
          },
        ],
      } as any,
      refundedLines: [{ identifier: 'line-1', quantity: 1 }],
    });

    expect(saveMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        id: 'order-3',
        status: 'REFUNDED',
      })
    );
    expect(saveMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        refundId: 'generated-order-id',
      })
    );
    expect(saveMock).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        refundType: 'FULL',
      })
    );
  });

  it('rejects refund quantities that exceed what remains refundable', async () => {
    const queryMock = jest.mocked(DataStore.query);
    const saveMock = jest.mocked(DataStore.save);

    queryMock.mockResolvedValueOnce({
      id: 'order-4',
      tenantId: 'test-tenant',
      status: 'PARTIALLY_REFUNDED',
      employeeId: 'employee-1',
      orderNo: '51-25-260316-0004',
      subtotal: 10,
      tax: 0,
      total: 10,
      lines: [
        {
          identifier: 'line-1',
          productId: 'product-1',
          productName: 'Rice',
          quantity: 2,
          price: 5,
          unitOfMeasure: 'EA',
          barcode: null,
          sku: null,
          lineTotalBeforeTax: 10,
        },
      ],
      orderDate: '2026-03-16T12:00:00.000Z',
      createdAt: '2026-03-16T12:00:00.000Z',
      updatedAt: '2026-03-16T12:00:00.000Z',
    } as any);
    queryMock.mockResolvedValueOnce([
      {
        id: 'refund-line-1',
        orderId: 'order-4',
        orderLineIdentifier: 'line-1',
        quantityRefunded: 1,
      },
    ] as any);

    await expect(
      OrderService.refund({
        id: 'order-4',
        by: {
          id: 'employee-2',
          firstName: 'Refund',
          lastName: 'Cashier',
        } as any,
        order: {
          id: 'order-4',
          orderNo: '51-25-260316-0004',
          subtotal: 10,
          tax: 0,
          total: 10,
          status: 'PARTIALLY_REFUNDED',
          employeeId: 'employee-1',
          employeeName: 'Original Cashier',
          orderDate: '2026-03-16T12:00:00.000Z',
          lines: [
            {
              identifier: 'line-1',
              quantity: 2,
              productId: 'product-1',
              productName: 'Rice',
              price: 5,
              unitOfMeasure: 'EA',
              barcode: null,
              sku: null,
              lineTotalBeforeTax: 10,
            },
          ],
        } as any,
        refundedLines: [{ identifier: 'line-1', quantity: 2 }],
      })
    ).rejects.toThrow('only has 1 refundable units remaining');

    expect(saveMock).not.toHaveBeenCalled();
  });

  it('keeps partially refunded orders visible in the paid search results', () => {
    const results = OrderService.search(
      [
        {
          id: 'paid-1',
          orderNo: '1-OWNER-260420-0001',
          status: 'PAID',
          total: 10.48,
          subtotal: 10.48,
          baseSubtotal: 14.97,
          lineDiscountTotal: 4.49,
          orderDiscountTotal: 0,
          discountTotal: 4.49,
          savingsTotal: 4.49,
          tax: 0,
          employeeId: 'employee-1',
          employeeName: 'Cashier',
          orderDate: '2026-04-20T10:00:00.000Z',
          createdAt: '2026-04-20T10:00:00.000Z',
          lines: [],
        },
        {
          id: 'partial-1',
          orderNo: '1-OWNER-260420-0002',
          status: 'PARTIALLY_REFUNDED',
          total: 10.48,
          subtotal: 10.48,
          baseSubtotal: 14.97,
          lineDiscountTotal: 4.49,
          orderDiscountTotal: 0,
          discountTotal: 4.49,
          savingsTotal: 4.49,
          tax: 0,
          employeeId: 'employee-1',
          employeeName: 'Cashier',
          orderDate: '2026-04-20T11:00:00.000Z',
          createdAt: '2026-04-20T11:00:00.000Z',
          lines: [],
        },
      ] as any,
      {
        status: 'PAID' as any,
      }
    );

    expect(results.map((order) => order.id)).toEqual(['partial-1', 'paid-1']);
  });
});
