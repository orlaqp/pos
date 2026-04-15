import { OrderLineEntity } from '@pos/orders/data-access';
import { EACH } from '@pos/unit-of-measures/data-access';

export const spreadOrderLinesForVoid = (
    lines: OrderLineEntity[] | null | undefined
) => {
    const spreadLines: OrderLineEntity[] = [];

    lines?.forEach((line) => {
        if (line.unitOfMeasure === EACH) {
            const originalQuantity = line.quantity || 0;
            const unitPrice = originalQuantity > 0 ? line.price / originalQuantity : line.price;
            const unitBasePrice =
                originalQuantity > 0 && line.basePrice != null
                    ? line.basePrice / originalQuantity
                    : line.basePrice;
            const unitNetUnitPrice =
                originalQuantity > 0 && line.netUnitPrice != null
                    ? line.netUnitPrice / originalQuantity
                    : line.netUnitPrice;
            const unitLineSubtotalBeforeOrderDiscount =
                originalQuantity > 0 && line.lineSubtotalBeforeOrderDiscount != null
                    ? line.lineSubtotalBeforeOrderDiscount / originalQuantity
                    : line.lineSubtotalBeforeOrderDiscount;
            const unitLineDiscountTotal =
                originalQuantity > 0 && line.lineDiscountTotal != null
                    ? line.lineDiscountTotal / originalQuantity
                    : line.lineDiscountTotal;
            const unitAllocatedOrderDiscountTotal =
                originalQuantity > 0 && line.allocatedOrderDiscountTotal != null
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

            for (let i = 0; i < line.quantity; i++) {
                spreadLines.push({
                    ...line,
                    quantity: 1,
                    price: unitPrice,
                    basePrice: unitBasePrice,
                    netUnitPrice: unitNetUnitPrice,
                    lineSubtotalBeforeOrderDiscount: unitLineSubtotalBeforeOrderDiscount,
                    lineDiscountTotal: unitLineDiscountTotal,
                    allocatedOrderDiscountTotal: unitAllocatedOrderDiscountTotal,
                    lineTotalBeforeTax: unitLineTotalBeforeTax,
                    lineTotalAfterTax: unitLineTotalAfterTax,
                    ebtPaidAmount: unitEbtPaidAmount,
                    nonEbtPaidAmount: unitNonEbtPaidAmount,
                });
            }
            return;
        }

        spreadLines.push(line);
    });

    return spreadLines;
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
