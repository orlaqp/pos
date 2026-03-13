import { OrderLineEntity } from '@pos/orders/data-access';
import { EACH } from '@pos/unit-of-measures/data-access';

export const spreadOrderLinesForVoid = (
    lines: OrderLineEntity[] | null | undefined
) => {
    const spreadLines: OrderLineEntity[] = [];

    lines?.forEach((line) => {
        if (line.unitOfMeasure === EACH) {
            for (let i = 0; i < line.quantity; i++) {
                spreadLines.push({ ...line, quantity: 1 });
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
        (prev, next) => prev + next.price * next.quantity,
        0
    );

    return {
        refundTotal,
        newTotal: orderTotal - refundTotal,
    };
};
