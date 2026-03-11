export type EbtPaymentInput = {
  type: string;
  amount: number;
};

export type EbtOrderLineInput = {
  identifier?: string;
  quantity: number;
  price: number;
  isEBTEligible?: boolean;
};

export type EbtLineAllocation = {
  isEBTEligible: boolean;
  ebtPaidAmount: number;
  nonEbtPaidAmount: number;
};

export function getLineTotal(quantity: number, price: number) {
  return +(quantity * price).toFixed(2);
}

export function sumEbtPayment(payments: EbtPaymentInput[]) {
  return payments.reduce((acc, payment) => {
    if (payment.type.toUpperCase() !== 'EBT') return acc;
    return acc + +payment.amount;
  }, 0);
}

export function getEbtEligibleTotal(lines: EbtOrderLineInput[]) {
  return lines.reduce((acc, line) => {
    if (!line.isEBTEligible) return acc;
    return acc + getLineTotal(line.quantity, line.price);
  }, 0);
}

export function validateEbtPayment(
  lines: EbtOrderLineInput[],
  payments: EbtPaymentInput[]
) {
  const ebtPaymentTotal = +sumEbtPayment(payments).toFixed(2);
  const ebtEligibleTotal = +getEbtEligibleTotal(lines).toFixed(2);

  return {
    valid: ebtPaymentTotal <= ebtEligibleTotal,
    ebtPaymentTotal,
    ebtEligibleTotal,
  };
}

export function buildEbtAllocations(
  lines: EbtOrderLineInput[],
  payments: EbtPaymentInput[]
) {
  const allocations: Record<string, EbtLineAllocation> = {};
  let remainingEbt = +sumEbtPayment(payments).toFixed(2);

  lines.forEach((line, index) => {
    const lineTotal = getLineTotal(line.quantity, line.price);
    const isEligible = !!line.isEBTEligible;
    const identifier = line.identifier || `line-${index}`;

    if (!isEligible || remainingEbt <= 0) {
      allocations[identifier] = {
        isEBTEligible: isEligible,
        ebtPaidAmount: 0,
        nonEbtPaidAmount: lineTotal,
      };
      return;
    }

    const ebtPaidAmount = +Math.min(lineTotal, remainingEbt).toFixed(2);
    const nonEbtPaidAmount = +(lineTotal - ebtPaidAmount).toFixed(2);
    remainingEbt = +(remainingEbt - ebtPaidAmount).toFixed(2);

    allocations[identifier] = {
      isEBTEligible: isEligible,
      ebtPaidAmount,
      nonEbtPaidAmount,
    };
  });

  return allocations;
}
