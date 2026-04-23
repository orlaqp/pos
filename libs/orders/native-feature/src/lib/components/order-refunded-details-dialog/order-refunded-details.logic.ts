import { OrderRefund } from '@pos/shared/models';
import {
    UIOrderSummaryDiscountBreakdownItem,
    UIOrderSummaryViewModel,
} from '@pos/shared/ui-native';
import { OrderEntity, PaymentEntity } from '@pos/orders/data-access';

export interface RefundedOrderDetailsSummary {
    latestRefundDate?: string;
    latestRefundedBy?: string;
    totalRefundAmount: number;
    refundPayments: PaymentEntity[];
}

export const buildOrderSummaryFromOrder = (
    order: OrderEntity,
): UIOrderSummaryViewModel => ({
    lines: (order.lines || []).map((line) => ({
        id: String(line.identifier || line.productId),
        name: line.productName,
        quantity: Number(line.quantity || 0),
        unitLabel: String(line.unitOfMeasure || '').toLowerCase(),
        unitPrice: Number(line.basePrice ?? line.price ?? 0),
        originalTotal:
            Number(line.basePrice ?? line.price ?? 0) *
            Number(line.quantity || 0),
        finalTotal:
            Number(line.lineTotalBeforeTax || 0) +
            Number(line.allocatedOrderDiscountTotal || 0),
        savings: Number(line.lineDiscountTotal || 0),
        discounts: (line.appliedDiscounts || []).map((discount) => ({
            discountApplicationId: String(discount.discountApplicationId || ''),
            name:
                discount.applicationType === 'PRICE_OVERRIDE'
                    ? 'Price override'
                    : discount.code || discount.name,
            discountAmount: Number(discount.discountAmount || 0),
        })),
    })),
    promoCodes: order.promoCodes || [],
    warnings: order.appliedDiscountSummary?.warnings || [],
    subtotal: Number(order.subtotal || 0),
    discountTotal: Number(order.discountTotal || 0),
    tax: Number(order.tax || 0),
    total: Number(order.total || 0),
    savingsTotal: Number(order.savingsTotal ?? order.discountTotal ?? 0),
    ebtEligibleTotal: (order.lines || []).reduce((sum, line) => {
        if (!line?.isEBTEligible) return sum;
        return sum + Number(line.lineTotalBeforeTax || 0);
    }, 0),
});

export const buildDiscountBreakdownFromOrder = (
    order: OrderEntity,
): UIOrderSummaryDiscountBreakdownItem[] => [
    ...(order.appliedDiscountSummary?.lineSummaries || []).flatMap(
        (lineSummary) =>
            (lineSummary.discounts || []).map((discount) => ({
                discountApplicationId: String(
                    discount.discountApplicationId || '',
                ),
                name:
                    discount.applicationType === 'PRICE_OVERRIDE'
                        ? 'Price override'
                        : discount.code || discount.name,
                discountAmount: Number(discount.discountAmount || 0),
                scope: 'LINE' as const,
            })),
    ),
    ...(order.appliedDiscountSummary?.orderLevelAdjustments || []).map(
        (discount) => ({
            discountApplicationId: String(discount.discountApplicationId || ''),
            name: discount.name,
            discountAmount: Number(discount.discountAmount || 0),
            scope: 'ORDER' as const,
        }),
    ),
];

export const buildRefundedOrderDetailsSummary = (
    order: OrderEntity,
    refunds: OrderRefund[],
): RefundedOrderDetailsSummary => {
    const sortedRefunds = [...(refunds || [])].sort((left, right) =>
        String(left.refundDate || '').localeCompare(
            String(right.refundDate || ''),
        ),
    );
    const latestRefund = sortedRefunds[sortedRefunds.length - 1];
    const paymentsByType = sortedRefunds.reduce<Map<string, number>>(
        (acc, refund) => {
            (refund.refundPayments || []).forEach((payment) => {
                const type = String(payment?.type || '').toUpperCase();
                const nextAmount =
                    Number(acc.get(type) || 0) + Number(payment?.amount || 0);
                acc.set(
                    type,
                    Math.round((nextAmount + Number.EPSILON) * 100) / 100,
                );
            });
            return acc;
        },
        new Map<string, number>(),
    );

    return {
        latestRefundDate: latestRefund?.refundDate || undefined,
        latestRefundedBy:
            latestRefund?.createdByEmployeeName ||
            order.refundInfo?.employeeName ||
            undefined,
        totalRefundAmount: sortedRefunds.reduce(
            (sum, refund) => sum + Number(refund.refundAmount || 0),
            0,
        ),
        refundPayments: Array.from(paymentsByType.entries()).map(
            ([type, amount]) => ({
                type: type as PaymentEntity['type'],
                amount,
            }),
        ),
    };
};
