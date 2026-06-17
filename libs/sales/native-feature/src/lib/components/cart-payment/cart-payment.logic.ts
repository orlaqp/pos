export type PaymentKey = 'cash' | 'check' | 'cc' | 'credit' | 'ebt';

type NumericMap = Partial<Record<PaymentKey, number | string>>;

export const toNumber = (value: unknown) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};

export const getAutoFillAmount = (
    paymentType: PaymentKey,
    values: NumericMap,
    paymentMethods: PaymentKey[],
    total: number,
    ebtEligibleTotal: number
) => {
    const assignedFromOtherMethods = paymentMethods.reduce((acc, method) => {
        if (method === paymentType) return acc;
        return acc + toNumber(values[method] || 0);
    }, 0);

    const remaining = Math.max(0, total - assignedFromOtherMethods);
    const defaultAmount =
        paymentType === 'ebt'
            ? Math.min(remaining, ebtEligibleTotal)
            : remaining;

    return +defaultAmount.toFixed(2);
};

export const shouldRestoreValue = (value: unknown) => {
    return `${value ?? ''}`.trim() === '';
};

export const getRestoredValue = (previous: number | undefined) => {
    return +((previous ?? 0).toFixed(2));
};
