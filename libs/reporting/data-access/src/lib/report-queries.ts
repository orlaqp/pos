import { DataStore } from '@pos/shared/amplify';
import { Order, OrderStatus } from '@pos/shared/models';
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
    const settled = await Promise.all(
        statuses.map((status) => getSalesForRange(status, range).catch(() => []))
    );

    return settled.flat();
};

export const getOpenOrders = async () =>
    DataStore.query(Order, (o) => o.status.eq(OrderStatus.OPEN));
