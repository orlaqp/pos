/* eslint-disable @nx/enforce-module-boundaries */
import {
  buildEbtAllocations,
  getEbtEligibleTotal,
  getLineTotal,
  sumEbtPayment,
  validateEbtPayment,
} from './ebt-allocation';
import { getInventoryQuantityDelta, OrderService } from './order.service';
import { DataStore } from '@pos/shared/amplify';
import { StationService } from '@pos/settings/data-access';
import { stampTenant } from '@pos/auth/data-access';
import { Alert } from 'react-native';
import { EmployeeService } from '@pos/employees/data-access';

jest.mock('@pos/shared/amplify', () => ({
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

  it('stamps tenantId when refunding an order missing tenant ownership metadata', async () => {
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
      lines: [],
      orderDate: '2026-03-16T12:00:00.000Z',
      createdAt: '2026-03-16T12:00:00.000Z',
      updatedAt: '2026-03-16T12:00:00.000Z',
    } as any);

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
        items: [],
      } as any,
      refundedLines: [],
    });

    expect(saveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'order-1',
        tenantId: 'test-tenant',
        status: 'REFUNDED',
        inventoryApplyState: 'PENDING',
        inventoryApplyOperationId: 'ORDER:order-1:REFUNDED',
      })
    );
  });

  it('creates a replacement open order with a generated id when a refund leaves remaining items', async () => {
    const queryMock = jest.mocked(DataStore.query);
    const saveMock = jest.mocked(DataStore.save);
    const employeeServiceMock = jest.mocked(EmployeeService.getById);
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

    employeeServiceMock.mockResolvedValue({
      id: 'employee-1',
      firstName: 'Original',
      lastName: 'Cashier',
    } as any);

    (sharedModels.Order as any).copyOf = (existing: any, mutator: (draft: any) => void) => {
      const draft = {
        ...existing,
        refundInfo: null,
      };
      mutator(draft);
      return draft;
    };

    await OrderService.refund({
      id: 'order-1',
      by: {
        id: 'employee-2',
        firstName: 'Refund',
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
        employeeName: 'Original Cashier',
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

    expect(saveMock).toHaveBeenCalledTimes(2);
    expect(saveMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        id: 'generated-order-id',
        status: 'OPEN',
        employeeId: 'employee-1',
      })
    );
  });
});
