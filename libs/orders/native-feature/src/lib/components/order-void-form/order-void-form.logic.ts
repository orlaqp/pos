import { OrderLineEntity } from '@pos/orders/data-access';
import { EACH } from '@pos/unit-of-measures/data-access';

export type RefundVoidLineGroup = {
    remainingItems: OrderLineEntity[];
    refundedItems: OrderLineEntity[];
};

const getRefundedQuantityValue = (
    refundedQuantities:
        | Map<string, number>
        | Record<string, number>
        | null
        | undefined,
    identifier: string
) => {
    if (!refundedQuantities) return 0;
    if (refundedQuantities instanceof Map) {
        return Number(refundedQuantities.get(identifier) || 0);
    }

    return Number(refundedQuantities[identifier] || 0);
};

const scaleLineForQuantity = (
    line: OrderLineEntity,
    quantity: number
): OrderLineEntity => {
    if (line.unitOfMeasure === EACH) {
        const originalQuantity = line.quantity || 0;
        const unitPrice =
            originalQuantity > 0 ? line.price / originalQuantity : line.price;
        const unitBasePrice =
            originalQuantity > 0 && line.basePrice != null
                ? line.basePrice / originalQuantity
                : line.basePrice;
        const unitNetUnitPrice =
            originalQuantity > 0 && line.netUnitPrice != null
                ? line.netUnitPrice / originalQuantity
                : line.netUnitPrice;
        const unitLineSubtotalBeforeOrderDiscount =
            originalQuantity > 0 &&
            line.lineSubtotalBeforeOrderDiscount != null
                ? line.lineSubtotalBeforeOrderDiscount / originalQuantity
                : line.lineSubtotalBeforeOrderDiscount;
        const unitLineDiscountTotal =
            originalQuantity > 0 && line.lineDiscountTotal != null
                ? line.lineDiscountTotal / originalQuantity
                : line.lineDiscountTotal;
        const unitAllocatedOrderDiscountTotal =
            originalQuantity > 0 &&
            line.allocatedOrderDiscountTotal != null
                ? line.allocatedOrderDiscountTotal / originalQuantity
                : line.allocatedOrderDiscountTotal;
        const unitLineTotalBeforeTax =
            originalQuantity > 0 && line.lineTotalBeforeTax != null
                ? line.lineTotalBeforeTax / originalQuantity
                : line.lineTotalBeforeTax;
        const unitLineTotalAfterTax =
            originalQuantity > 0 && line.lineTotalAfterTax != null
                ? line.lineTotalAfterTax / originalQuantity
                : line.lineTotalAfterTax;
        const unitEbtPaidAmount =
            originalQuantity > 0 && line.ebtPaidAmount != null
                ? line.ebtPaidAmount / originalQuantity
                : line.ebtPaidAmount;
        const unitNonEbtPaidAmount =
            originalQuantity > 0 && line.nonEbtPaidAmount != null
                ? line.nonEbtPaidAmount / originalQuantity
                : line.nonEbtPaidAmount;

        return {
            ...line,
            quantity,
            price: unitPrice * quantity,
            basePrice:
                unitBasePrice == null ? unitBasePrice : unitBasePrice * quantity,
            netUnitPrice: unitNetUnitPrice,
            lineSubtotalBeforeOrderDiscount:
                unitLineSubtotalBeforeOrderDiscount == null
                    ? unitLineSubtotalBeforeOrderDiscount
                    : unitLineSubtotalBeforeOrderDiscount * quantity,
            lineDiscountTotal:
                unitLineDiscountTotal == null
                    ? unitLineDiscountTotal
                    : unitLineDiscountTotal * quantity,
            allocatedOrderDiscountTotal:
                unitAllocatedOrderDiscountTotal == null
                    ? unitAllocatedOrderDiscountTotal
                    : unitAllocatedOrderDiscountTotal * quantity,
            lineTotalBeforeTax:
                unitLineTotalBeforeTax == null
                    ? unitLineTotalBeforeTax
                    : unitLineTotalBeforeTax * quantity,
            lineTotalAfterTax:
                unitLineTotalAfterTax == null
                    ? unitLineTotalAfterTax
                    : unitLineTotalAfterTax * quantity,
            ebtPaidAmount:
                unitEbtPaidAmount == null
                    ? unitEbtPaidAmount
                    : unitEbtPaidAmount * quantity,
            nonEbtPaidAmount:
                unitNonEbtPaidAmount == null
                    ? unitNonEbtPaidAmount
                    : unitNonEbtPaidAmount * quantity,
        };
    }

    const ratio =
        Number(line.quantity || 0) > 0 ? quantity / Number(line.quantity || 0) : 0;

    return {
        ...line,
        quantity,
        lineSubtotalBeforeOrderDiscount:
            line.lineSubtotalBeforeOrderDiscount == null
                ? line.lineSubtotalBeforeOrderDiscount
                : line.lineSubtotalBeforeOrderDiscount * ratio,
        lineDiscountTotal:
            line.lineDiscountTotal == null
                ? line.lineDiscountTotal
                : line.lineDiscountTotal * ratio,
        allocatedOrderDiscountTotal:
            line.allocatedOrderDiscountTotal == null
                ? line.allocatedOrderDiscountTotal
                : line.allocatedOrderDiscountTotal * ratio,
        lineTotalBeforeTax:
            line.lineTotalBeforeTax == null
                ? line.lineTotalBeforeTax
                : line.lineTotalBeforeTax * ratio,
        lineTotalAfterTax:
            line.lineTotalAfterTax == null
                ? line.lineTotalAfterTax
                : line.lineTotalAfterTax * ratio,
        ebtPaidAmount:
            line.ebtPaidAmount == null ? line.ebtPaidAmount : line.ebtPaidAmount * ratio,
        nonEbtPaidAmount:
            line.nonEbtPaidAmount == null
                ? line.nonEbtPaidAmount
                : line.nonEbtPaidAmount * ratio,
    };
};

export const groupOrderLinesForVoid = (
    lines: OrderLineEntity[] | null | undefined,
    refundedQuantities?:
        | Map<string, number>
        | Record<string, number>
        | null
): RefundVoidLineGroup => {
    const grouped: RefundVoidLineGroup = {
        remainingItems: [],
        refundedItems: [],
    };

    lines?.forEach((line) => {
        const refundedQuantity = Math.max(
            0,
            getRefundedQuantityValue(refundedQuantities, line.identifier)
        );
        const originalQuantity = Number(line.quantity || 0);
        const remainingQuantity = Math.max(0, originalQuantity - refundedQuantity);

        if (line.unitOfMeasure === EACH) {
            for (let i = 0; i < remainingQuantity; i++) {
                grouped.remainingItems.push(scaleLineForQuantity(line, 1));
            }
            for (let i = 0; i < refundedQuantity; i++) {
                grouped.refundedItems.push(scaleLineForQuantity(line, 1));
            }
            return;
        }

        if (remainingQuantity > 0) {
            grouped.remainingItems.push(
                scaleLineForQuantity(line, remainingQuantity)
            );
        }
        if (refundedQuantity > 0) {
            grouped.refundedItems.push(scaleLineForQuantity(line, refundedQuantity));
        }
    });

    return grouped;
};

export const spreadOrderLinesForVoid = (
    lines: OrderLineEntity[] | null | undefined,
    refundedQuantities?:
        | Map<string, number>
        | Record<string, number>
        | null
) => {
    return groupOrderLinesForVoid(lines, refundedQuantities).remainingItems;
};

export const calculateRefundSummary = (
    orderTotal: number,
    linesToRefund: OrderLineEntity[]
) => {
    const refundTotal = linesToRefund.reduce(
        (prev, next) =>
            prev +
            Number(
                next.lineTotalBeforeTax ??
                    next.lineTotalAfterTax ??
                    next.price * next.quantity
            ),
        0
    );

    return {
        refundTotal,
        newTotal: orderTotal - refundTotal,
    };
};
