export type SurchargePayment = {
  type: string;
  amount: number;
  baseAmount?: number | null;
  surchargeRate?: number | null;
  surchargeAmount?: number | null;
};

const roundMoney = (value: number) =>
  Math.round(((Number.isFinite(value) ? value : 0) + Number.EPSILON) * 100) / 100;

export const normalizeSurchargePercent = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

export const isCreditCardPayment = (payment: { type?: string | null }) =>
  String(payment?.type || '').toUpperCase() === 'CC';

export const calculateCreditCardSurcharge = (baseAmount: number, percent: number) => {
  const amount = Number(baseAmount || 0);
  const rate = normalizeSurchargePercent(percent);
  if (amount <= 0 || rate <= 0) return 0;
  return roundMoney(amount * (rate / 100));
};

export const getPaymentBaseAmount = (payment: SurchargePayment) =>
  roundMoney(Number(payment.baseAmount ?? payment.amount ?? 0));

export const getPaymentSurchargeAmount = (payment: SurchargePayment) =>
  roundMoney(Number(payment.surchargeAmount ?? 0));

export const getPaymentChargedAmount = (payment: SurchargePayment) =>
  roundMoney(getPaymentBaseAmount(payment) + getPaymentSurchargeAmount(payment));

export const enrichCreditCardPaymentsWithSurcharge = <T extends SurchargePayment>(
  payments: T[],
  percent: number
) =>
  payments.map((payment) => {
    if (!isCreditCardPayment(payment)) return payment;
    const baseAmount = roundMoney(Number(payment.amount || 0));
    const surchargeRate = normalizeSurchargePercent(percent);
    const surchargeAmount = calculateCreditCardSurcharge(baseAmount, surchargeRate);
    return { ...payment, amount: baseAmount, baseAmount, surchargeRate, surchargeAmount };
  });
