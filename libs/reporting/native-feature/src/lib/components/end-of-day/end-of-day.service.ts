import { ProductEntity } from '@pos/products/data-access';
import { EmployeeEntity } from '@pos/employees/data-access';
import { Order, OrderRefund, OrderRefundLine } from '@pos/shared/models';

export const getEmployeeItems = (employees: EmployeeEntity[]) => {
    if (!employees) return [];

    const items = employees
        .map(e => ({ label: `${e.firstName} ${e.lastName}`, value: e.id }))
        .sort((left, right) => left.label.localeCompare(right.label, undefined, { sensitivity: 'base' }));
    items.unshift({ label: 'All', value: '' });

    return items;
}

export const getProductItems = (products: ProductEntity[]) => {
    if (!products) return [];

    const items = products
        .map(p => ({ label: p.name, value: p.id }))
        .sort((left, right) => left.label.localeCompare(right.label, undefined, { sensitivity: 'base' }));
    items.unshift({ label: 'All', value: '' });

    return items;
}

export interface OrdersFilterRequest {
    openedBy?: null | undefined | string;
    closedBy?: null | undefined | string;
    productId?: null | undefined | string;
}

export interface PaymentMethodsSummary {
    CC: number;
    CASH: number;
    CHECK: number;
    EBT: number;
}

export interface OrderPaymentDetailRow {
    type: keyof PaymentMethodsSummary;
    amount: number;
    kind: 'payment' | 'refund';
}

export interface EndOfDayReferenceSummary {
    grossSales: number;
    discounts: number;
    refunds: number;
    tax: number;
    netSales: number;
}

const roundMoney = (value: number) => Math.round(value * 100) / 100;

const createEmptyPaymentSummary = (): PaymentMethodsSummary => ({
    CC: 0,
    CASH: 0,
    CHECK: 0,
    EBT: 0,
});

const compareOrdersByTicketCreatedAtDesc = (left: Order, right: Order) => {
    const leftCreated = String(
        left.createdAt || left.orderDate || left.updatedAt || ''
    );
    const rightCreated = String(
        right.createdAt || right.orderDate || right.updatedAt || ''
    );
    return rightCreated.localeCompare(leftCreated);
};

const getScopedRefundAmountForOrder = (
    orderId: string | undefined,
    request: OrdersFilterRequest,
    refunds: OrderRefund[],
    refundLines: OrderRefundLine[]
) => {
    const normalizedOrderId = String(orderId || '').trim();
    if (!normalizedOrderId) {
        return 0;
    }

    if (request.productId) {
        return refundLines
            .filter(
                (line) =>
                    line.orderId === normalizedOrderId &&
                    line.productId === request.productId
            )
            .reduce((sum, line) => sum + Number(line.lineRefundAmount || 0), 0);
    }

    return refunds
        .filter((refund) => refund.orderId === normalizedOrderId)
        .reduce((sum, refund) => sum + Number(refund.refundAmount || 0), 0);
};

const getOrderDiscountReference = (order: Order) => {
    const explicitDiscountTotal = Number(order.discountTotal || 0);
    if (explicitDiscountTotal > 0) {
        return explicitDiscountTotal;
    }

    return (order.lines || []).reduce((sum, line) => {
        return (
            sum +
            Number(line?.lineDiscountTotal || 0) +
            Number(line?.allocatedOrderDiscountTotal || 0)
        );
    }, 0);
};

const getKnownPaymentType = (type: string | undefined | null) => {
    const normalized = String(type || '').toUpperCase() as keyof PaymentMethodsSummary;
    return normalized === 'CC' ||
        normalized === 'CASH' ||
        normalized === 'CHECK' ||
        normalized === 'EBT'
        ? normalized
        : null;
};

const allocateAmountAcrossPayments = (
    payments: Array<{ type?: string | null; amount?: number | null }>,
    targetAmount: number
) => {
    const normalizedTarget = roundMoney(Math.max(0, Number(targetAmount || 0)));
    if (normalizedTarget <= 0) {
        return [] as Array<{ type: keyof PaymentMethodsSummary; amount: number }>;
    }

    const normalizedPayments = (payments || [])
        .map((payment) => ({
            type: getKnownPaymentType(payment?.type),
            amount: roundMoney(Math.max(0, Number(payment?.amount || 0))),
        }))
        .filter(
            (payment): payment is { type: keyof PaymentMethodsSummary; amount: number } =>
                payment.type != null && payment.amount > 0
        );

    const totalAvailable = normalizedPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
    );
    if (totalAvailable <= 0) {
        return normalizedPayments;
    }

    let remainingAmount = Math.min(normalizedTarget, totalAvailable);

    return normalizedPayments.map((payment, index) => {
        if (remainingAmount <= 0) {
            return {
                ...payment,
                amount: 0,
            };
        }

        const allocatedAmount =
            index === normalizedPayments.length - 1
                ? remainingAmount
                : roundMoney((payment.amount / totalAvailable) * normalizedTarget);
        const cappedAmount = Math.min(payment.amount, allocatedAmount, remainingAmount);
        remainingAmount = roundMoney(remainingAmount - cappedAmount);

        return {
            ...payment,
            amount: cappedAmount,
        };
    });
};

const buildRefundedQuantityMap = (
    orderId: string | undefined,
    refundLines: OrderRefundLine[]
) => {
    const normalizedOrderId = String(orderId || '').trim();
    return refundLines.reduce((acc, line) => {
        if (String(line.orderId || '').trim() !== normalizedOrderId) {
            return acc;
        }

        const identifier = String(line.orderLineIdentifier || '').trim();
        if (!identifier) {
            return acc;
        }

        acc.set(
            identifier,
            roundMoney((acc.get(identifier) || 0) + Number(line.quantityRefunded || 0))
        );
        return acc;
    }, new Map<string, number>());
};

const getLineActiveRatio = (line: Order['lines'][number], refundedQuantity: number) => {
    const originalQuantity = Number(line?.quantity || 0);
    if (originalQuantity <= 0) {
        return 0;
    }

    const remainingQuantity = Math.max(0, originalQuantity - Number(refundedQuantity || 0));
    return remainingQuantity / originalQuantity;
};

const getScopedTaxForOrder = (
    order: Order,
    request: OrdersFilterRequest,
    refunds: OrderRefund[],
    refundLines: OrderRefundLine[]
) => {
    if (request.productId) {
        const refundedQuantities = buildRefundedQuantityMap(order.id, refundLines);
        return (order.lines || [])
            .filter((line) => line?.productId === request.productId)
            .reduce((sum, line) => {
                const ratio = getLineActiveRatio(
                    line,
                    refundedQuantities.get(String(line?.identifier || '')) || 0
                );
                return roundMoney(sum + Number(line?.tax || 0) * ratio);
            }, 0);
    }

    const total = Number(order.total || 0);
    if (total <= 0) {
        return roundMoney(Number(order.tax || 0));
    }

    const refundedAmount = getScopedRefundAmountForOrder(
        order.id,
        request,
        refunds,
        refundLines
    );
    const activeRatio = Math.max(
        0,
        Math.min(1, (total - refundedAmount) / total)
    );
    return roundMoney(Number(order.tax || 0) * activeRatio);
};

const getLineTenderAmounts = (line: Order['lines'][number], ratio: number) => {
    const lineTotalBeforeTax = Number(line?.lineTotalBeforeTax);
    const lineTotalAfterTax = Number(line?.lineTotalAfterTax);
    const linePriceTotal = Number(line?.price || 0) * Number(line?.quantity || 0);
    const baseLineTotal = Number.isFinite(lineTotalBeforeTax)
        ? lineTotalBeforeTax
        : Number.isFinite(lineTotalAfterTax)
        ? lineTotalAfterTax
        : Number.isFinite(linePriceTotal)
        ? linePriceTotal
        : 0;
    const originalEbt = Number(line?.ebtPaidAmount || 0);
    const originalNonEbt =
        line?.nonEbtPaidAmount != null
            ? Number(line.nonEbtPaidAmount || 0)
            : Math.max(0, baseLineTotal - originalEbt);

    return {
        ebt: roundMoney(originalEbt * ratio),
        nonEbt: roundMoney(originalNonEbt * ratio),
    };
};

const buildRefundLinePaymentSummary = (
    order: Order,
    refund: OrderRefund,
    refundLines: OrderRefundLine[]
) => {
    const refundPaymentSummary = createEmptyPaymentSummary();
    const refundedLines = refundLines.filter((line) => line.refundId === refund.id);
    if (!refundedLines.length) {
        return refundPaymentSummary;
    }

    const refundLineTotals = refundedLines.reduce(
        (acc, refundLine) => {
            const orderLine = (order.lines || []).find(
                (line) =>
                    String(line?.identifier || '').trim() ===
                    String(refundLine.orderLineIdentifier || '').trim()
            );
            if (!orderLine) {
                return acc;
            }

            const originalQuantity = Number(orderLine.quantity || 0);
            const refundedQuantity = Number(refundLine.quantityRefunded || 0);
            if (originalQuantity <= 0 || refundedQuantity <= 0) {
                return acc;
            }

            const ratio = Math.min(1, refundedQuantity / originalQuantity);
            const tenderAmounts = getLineTenderAmounts(orderLine, ratio);
            acc.ebt = roundMoney(acc.ebt + tenderAmounts.ebt);
            acc.nonEbt = roundMoney(acc.nonEbt + tenderAmounts.nonEbt);
            acc.hasLineEconomics =
                acc.hasLineEconomics ||
                tenderAmounts.ebt > 0 ||
                tenderAmounts.nonEbt > 0;
            return acc;
        },
        { ebt: 0, nonEbt: 0, hasLineEconomics: false }
    );

    if (!refundLineTotals.hasLineEconomics) {
        return refundPaymentSummary;
    }

    const ebtPayments = (order.paymentInfo?.payments || []).filter(
        (payment) => getKnownPaymentType(payment?.type) === 'EBT'
    );
    const nonEbtPayments = (order.paymentInfo?.payments || []).filter((payment) => {
        const type = getKnownPaymentType(payment?.type);
        return type === 'CC' || type === 'CASH' || type === 'CHECK';
    });

    [...allocateAmountAcrossPayments(ebtPayments, refundLineTotals.ebt), ...allocateAmountAcrossPayments(nonEbtPayments, refundLineTotals.nonEbt)].forEach(
        (payment) => {
            refundPaymentSummary[payment.type] = roundMoney(
                refundPaymentSummary[payment.type] + payment.amount
            );
        }
    );

    return refundPaymentSummary;
};

const buildOrderPaymentSummary = (
    order: Order,
    request: OrdersFilterRequest,
    refunds: OrderRefund[],
    refundLines: OrderRefundLine[]
) => {
    const refundedQuantities = buildRefundedQuantityMap(order.id, refundLines);
    const activeTenderTotals = (order.lines || []).reduce(
        (acc, line) => {
            if (request.productId && line?.productId !== request.productId) {
                return acc;
            }

            const ratio = getLineActiveRatio(
                line,
                refundedQuantities.get(String(line?.identifier || '')) || 0
            );
            if (ratio <= 0) {
                return acc;
            }

            const tenderAmounts = getLineTenderAmounts(line, ratio);
            acc.ebt = roundMoney(acc.ebt + tenderAmounts.ebt);
            acc.nonEbt = roundMoney(acc.nonEbt + tenderAmounts.nonEbt);
            acc.hasLineEconomics =
                acc.hasLineEconomics ||
                tenderAmounts.ebt > 0 ||
                tenderAmounts.nonEbt > 0 ||
                Number(line?.lineTotalBeforeTax || 0) > 0 ||
                Number(line?.lineTotalAfterTax || 0) > 0 ||
                Number(line?.price || 0) > 0;
            return acc;
        },
        { ebt: 0, nonEbt: 0, hasLineEconomics: false }
    );

    if (!activeTenderTotals.hasLineEconomics) {
        const originalPaidAmount = roundMoney(
            (order.paymentInfo?.payments || []).reduce(
                (sum, payment) => sum + Number(payment?.amount || 0),
                0
            )
        );
        const orderTotal = Number(order.total || 0);
        const activeAmount = Math.max(
            0,
            roundMoney(
                (orderTotal > 0 ? orderTotal : originalPaidAmount) -
                    getScopedRefundAmountForOrder(order.id, request, refunds, refundLines)
            )
        );

        return allocateAmountAcrossPayments(
            order.paymentInfo?.payments || [],
            activeAmount
        ).reduce(
            (acc, payment) => {
                acc[payment.type] = roundMoney(acc[payment.type] + payment.amount);
                return acc;
            },
            { CC: 0, CASH: 0, CHECK: 0, EBT: 0 } as PaymentMethodsSummary
        );
    }

    const ebtPayments = (order.paymentInfo?.payments || []).filter(
        (payment) => getKnownPaymentType(payment?.type) === 'EBT'
    );
    const nonEbtPayments = (order.paymentInfo?.payments || []).filter(
        (payment) => {
            const type = getKnownPaymentType(payment?.type);
            return type === 'CC' || type === 'CASH' || type === 'CHECK';
        }
    );

    const allocatedEbt = allocateAmountAcrossPayments(
        ebtPayments,
        activeTenderTotals.ebt
    );
    const allocatedNonEbt = allocateAmountAcrossPayments(
        nonEbtPayments,
        activeTenderTotals.nonEbt
    );

    return [...allocatedEbt, ...allocatedNonEbt].reduce(
        (acc, payment) => {
            acc[payment.type] = roundMoney(acc[payment.type] + payment.amount);
            return acc;
        },
        { CC: 0, CASH: 0, CHECK: 0, EBT: 0 } as PaymentMethodsSummary
    );
};

const buildOriginalPaymentSummary = (order: Order) =>
    (order.paymentInfo?.payments || []).reduce(
        (acc, payment) => {
            const type = getKnownPaymentType(payment?.type);
            if (!type) {
                return acc;
            }

            acc[type] = roundMoney(acc[type] + Number(payment?.amount || 0));
            return acc;
        },
        { CC: 0, CASH: 0, CHECK: 0, EBT: 0 } as PaymentMethodsSummary
    );

const buildCapturedRefundPaymentSummary = (
    refund: OrderRefund,
    request: OrdersFilterRequest,
    refundLines: OrderRefundLine[]
) => {
    const refundPayments = (refund.refundPayments || [])
        .map((payment) => ({
            type: getKnownPaymentType(payment?.type),
            amount: roundMoney(Math.max(0, Number(payment?.amount || 0))),
        }))
        .filter(
            (payment): payment is { type: keyof PaymentMethodsSummary; amount: number } =>
                !!payment.type && payment.amount > 0
        );

    if (!refundPayments.length) {
        return { CC: 0, CASH: 0, CHECK: 0, EBT: 0 } as PaymentMethodsSummary;
    }

    const scopedRefundAmount = request.productId
        ? refundLines
              .filter(
                  (line) =>
                      line.refundId === refund.id &&
                      line.productId === request.productId
              )
              .reduce((sum, line) => sum + Number(line.lineRefundAmount || 0), 0)
        : Number(refund.refundAmount || 0);
    const refundAmount = Number(refund.refundAmount || 0);
    const ratio =
        refundAmount > 0 ? Math.min(1, roundMoney(scopedRefundAmount / refundAmount)) : 0;

    return refundPayments.reduce(
        (acc, payment) => {
            acc[payment.type] = roundMoney(acc[payment.type] + payment.amount * ratio);
            return acc;
        },
        { CC: 0, CASH: 0, CHECK: 0, EBT: 0 } as PaymentMethodsSummary
    );
};

const buildRefundPaymentSummaryForOrder = (
    order: Order,
    refund: OrderRefund,
    request: OrdersFilterRequest,
    refundLines: OrderRefundLine[]
) => {
    const capturedRefundSummary = buildCapturedRefundPaymentSummary(
        refund,
        request,
        refundLines
    );
    const hasCapturedRefundPayments = (Object.values(capturedRefundSummary) as number[]).some(
        (amount) => amount > 0
    );
    if (hasCapturedRefundPayments) {
        return capturedRefundSummary;
    }

    if (!request.productId) {
        const refundLineSummary = buildRefundLinePaymentSummary(order, refund, refundLines);
        const hasRefundLineSummary = (Object.values(refundLineSummary) as number[]).some(
            (amount) => amount > 0
        );
        if (hasRefundLineSummary) {
            return refundLineSummary;
        }
    }

    return allocateAmountAcrossPayments(
        order.paymentInfo?.payments || [],
        request.productId
            ? refundLines
                  .filter(
                      (line) =>
                          line.refundId === refund.id &&
                          line.productId === request.productId
                  )
                  .reduce((sum, line) => sum + Number(line.lineRefundAmount || 0), 0)
            : Number(refund.refundAmount || 0)
    ).reduce((acc, payment) => {
        acc[payment.type] = roundMoney(acc[payment.type] + payment.amount);
        return acc;
    }, createEmptyPaymentSummary());
};

export const buildOrderPaymentDetailRows = (
    order: Order,
    refunds: OrderRefund[] = [],
    refundLines: OrderRefundLine[] = []
): OrderPaymentDetailRow[] => {
    const paymentRows = (order.paymentInfo?.payments || [])
        .map((payment) => {
            const type = getKnownPaymentType(payment?.type);
            if (!type) {
                return null;
            }

            const amount = roundMoney(Number(payment?.amount || 0));
            if (amount <= 0) {
                return null;
            }

            return {
                type,
                amount,
                kind: 'payment' as const,
            };
        })
        .filter((row): row is OrderPaymentDetailRow => !!row);

    const refundRows = refunds.flatMap((refund) => {
        const refundSummary = buildRefundPaymentSummaryForOrder(
            order,
            refund,
            {},
            refundLines
        );

        return (Object.keys(refundSummary) as Array<keyof PaymentMethodsSummary>)
            .filter((type) => refundSummary[type] > 0)
            .map((type) => ({
                type,
                amount: refundSummary[type],
                kind: 'refund' as const,
            }));
    });

    return [...paymentRows, ...refundRows];
};

export const buildEndOfDayReferenceSummary = (
    orders: Order[],
    refunds: OrderRefund[],
    refundLines: OrderRefundLine[],
    request: OrdersFilterRequest
): EndOfDayReferenceSummary => {
    const discounts = orders.reduce(
        (sum, order) => sum + getOrderDiscountReference(order),
        0
    );
    const grossSales = orders.reduce(
        (sum, order) =>
            sum + Number(order.total || 0) + getOrderDiscountReference(order),
        0
    );
    const refundsTotal = orders.reduce(
        (sum, order) =>
            sum +
            getScopedRefundAmountForOrder(order.id, request, refunds, refundLines),
        0
    );
    const tax = orders.reduce(
        (sum, order) =>
            sum + getScopedTaxForOrder(order, request, refunds, refundLines),
        0
    );

    return {
        grossSales,
        discounts,
        refunds: roundMoney(refundsTotal),
        tax: roundMoney(tax),
        netSales: roundMoney(grossSales - discounts - refundsTotal),
    };
};

export const filterOrders = (
    orders: Order[],
    request: OrdersFilterRequest,
    refunds: OrderRefund[] = [],
    refundLines: OrderRefundLine[] = []
) => {
    const filtered = orders
        .filter((o) => {
            const openedById = o.createdBy?.id || o.employeeId;
            if (request.openedBy && openedById !== request.openedBy) return false;
            if (request.closedBy && o.paymentInfo?.employeeId !== request.closedBy) return false;

            if (!request.productId) return true;

            return o.lines.some((p) => p?.productId === request.productId);
        })
        .sort(compareOrdersByTicketCreatedAtDesc);

    const summary = filtered.reduce(
        (acc, order) => {
            const orderRefunds = refunds.filter((refund) => refund.orderId === order.id);
            const paymentSummary =
                !request.productId && orderRefunds.length > 0
                    ? orderRefunds.reduce((summaryAcc, refund) => {
                          const refundSummary = buildRefundPaymentSummaryForOrder(
                              order,
                              refund,
                              request,
                              refundLines
                          );
                          (Object.keys(refundSummary) as Array<keyof PaymentMethodsSummary>).forEach(
                              (type) => {
                                  summaryAcc[type] = roundMoney(
                                      summaryAcc[type] - refundSummary[type]
                                  );
                              }
                          );
                          return summaryAcc;
                      }, buildOriginalPaymentSummary(order))
                    : buildOrderPaymentSummary(
                          order,
                          request,
                          refunds,
                          refundLines
                      );

            (Object.keys(paymentSummary) as Array<keyof PaymentMethodsSummary>).forEach((type) => {
                acc[type] = roundMoney(acc[type] + paymentSummary[type]);
            });

            return acc;
        },
        { CC: 0, CASH: 0, CHECK: 0, EBT: 0 } as PaymentMethodsSummary
    );

    const references = buildEndOfDayReferenceSummary(
        filtered,
        refunds,
        refundLines,
        request
    );

    return {
        orders: filtered,
        summary,
        totalAmount: references.netSales,
        references,
    };
};
