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
});
