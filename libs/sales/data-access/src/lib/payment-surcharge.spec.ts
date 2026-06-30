import {
  calculateCreditCardSurcharge,
  enrichCreditCardPaymentsWithSurcharge,
  getPaymentBaseAmount,
  getPaymentSurchargeAmount,
} from './payment-surcharge';

describe('payment surcharge helpers', () => {
  it('calculates surcharge from base card amount and percent', () => {
    expect(calculateCreditCardSurcharge(60, 3)).toBe(1.8);
    expect(calculateCreditCardSurcharge(10.005, 2.5)).toBe(0.25);
  });

  it('returns zero for non-positive or invalid inputs', () => {
    expect(calculateCreditCardSurcharge(60, 0)).toBe(0);
    expect(calculateCreditCardSurcharge(0, 3)).toBe(0);
    expect(calculateCreditCardSurcharge(60, Number.NaN)).toBe(0);
  });

  it('enriches only credit-card payments', () => {
    expect(
      enrichCreditCardPaymentsWithSurcharge(
        [
          { type: 'CASH', amount: 40 },
          { type: 'CC', amount: 60 },
          { type: 'EBT', amount: 5 },
        ],
        3
      )
    ).toEqual([
      { type: 'CASH', amount: 40 },
      { type: 'CC', amount: 60, baseAmount: 60, surchargeRate: 3, surchargeAmount: 1.8 },
      { type: 'EBT', amount: 5 },
    ]);
  });

  it('reads legacy payments as base amount with zero surcharge', () => {
    expect(getPaymentBaseAmount({ type: 'CC', amount: 60 })).toBe(60);
    expect(getPaymentSurchargeAmount({ type: 'CC', amount: 60 })).toBe(0);
  });
});
