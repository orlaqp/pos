import {
  buildEbtAllocations,
  getEbtEligibleTotal,
  getLineTotal,
  sumEbtPayment,
  validateEbtPayment,
} from './ebt-allocation';

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
