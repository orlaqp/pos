export type PaymentKey = 'cash' | 'check' | 'cc' | 'ebt';

type NumericMap = Partial<Record<PaymentKey, number | string>>;

type SplitPaymentBalanceInput = {
    changedMethod: PaymentKey;
    activeMethods: PaymentKey[];
    values: NumericMap;
    total: number;
    ebtEligibleTotal: number;
};

type SplitPaymentBalanceResult = {
    values: Partial<Record<PaymentKey, number>>;
    calculatedMethod?: PaymentKey;
    cappedMethod?: PaymentKey;
};

const round2Dec = (value: number) => +value.toFixed(2);
const PAYMENT_KEYS: PaymentKey[] = ['cash', 'check', 'cc', 'ebt'];

export const toNumber = (value: unknown) => {
    const n = +value;
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

export const calculateSplitPaymentBalance = ({
    changedMethod,
    activeMethods,
    values,
    total,
    ebtEligibleTotal,
}: SplitPaymentBalanceInput): SplitPaymentBalanceResult => {
    const nextValues = PAYMENT_KEYS.reduce((acc, paymentKey) => {
        if (!(paymentKey in values)) return acc;
        acc[paymentKey] = round2Dec(toNumber(values[paymentKey]));
        return acc;
    }, {} as Partial<Record<PaymentKey, number>>);
    let cappedMethod: PaymentKey | undefined;

    if (changedMethod === 'ebt') {
        const cappedEbt = Math.min(
            toNumber(nextValues.ebt),
            Math.max(0, ebtEligibleTotal)
        );

        if (round2Dec(cappedEbt) !== round2Dec(toNumber(nextValues.ebt))) {
            cappedMethod = 'ebt';
        }

        nextValues.ebt = round2Dec(cappedEbt);
    }

    if (activeMethods.length !== 2) {
        return { values: nextValues, cappedMethod };
    }

    const calculatedMethod = activeMethods.find(
        (method) => method !== changedMethod
    );

    if (!calculatedMethod) {
        return { values: nextValues, cappedMethod };
    }

    const changedAmount = toNumber(nextValues[changedMethod]);
    const calculatedAmount =
        calculatedMethod === 'ebt'
            ? Math.min(
                  Math.max(0, total - changedAmount),
                  Math.max(0, ebtEligibleTotal)
              )
            : Math.max(0, total - changedAmount);

    nextValues[calculatedMethod] = round2Dec(calculatedAmount);

    return {
        values: nextValues,
        calculatedMethod,
        cappedMethod,
    };
};
