import { DataStore } from '@pos/shared/amplify';
import {
    CustomerCreditTransaction,
    Order,
    OrderRefund,
    OrderRefundLine,
    OrderStatus,
} from '@pos/shared/models';
import { DateRange } from '@pos/shared/ui-native';
import { getSalesForRange } from './reporting.service';

export interface OrdersForStatusesRequest {
    statuses: (OrderStatus | keyof typeof OrderStatus)[];
    range: DateRange;
}

export const getOrdersForStatuses = async ({
    statuses,
    range,
}: OrdersForStatusesRequest) => {
    return getSalesForRange(statuses, range).catch(() => []);
};

export const getOpenOrders = async () =>
    DataStore.query(Order, (o) => o.status.eq(OrderStatus.OPEN));

export const getRefundsForRange = async ({ range }: { range: DateRange }) => {
    const from = range.startDate.toISOString();
    const to = range.endDate.toISOString();

    const refunds = await DataStore.query(OrderRefund, (refund) =>
        refund.refundDate.between(from, to)
    );

    return [...refunds];
};

export const getRefundLinesForRefundIds = async (refundIds: string[]) => {
    const allLines = await DataStore.query(OrderRefundLine);
    const refundIdSet = new Set(refundIds);

    return allLines.filter((line) => refundIdSet.has(line.refundId));
};

export const getCustomerCreditTransactionsForRange = async ({
    range,
}: {
    range: DateRange;
}) => {
    const from = range.startDate.toISOString();
    const to = range.endDate.toISOString();

    const transactions = await DataStore.query(CustomerCreditTransaction, (transaction) =>
        transaction.transactionDate.between(from, to)
    );

    return [...transactions];
};
