import { GraphQLResult } from '@aws-amplify/api-graphql';
import { getSales, getSalesSummary } from '@pos/shared/api';
import { Order, OrderStatus, SalesSummary } from '@pos/shared/models';
import { DateRange } from '@pos/shared/ui-native';
import { API } from 'aws-amplify';

export const getSalesSummaryForRange = (
    status: OrderStatus | keyof typeof OrderStatus,
    range: DateRange
) => {
    const promise = API.graphql<SalesSummary>({
        query: getSalesSummary,
        variables: {
            status,
            from: range?.startDate.toISOString(),
            to: range?.endDate.toISOString(),
        },
    }) as Promise<GraphQLResult<{ getSalesSummary: SalesSummary }>>;

    return promise.then((r) => r.data?.getSalesSummary);
};

export const getSalesForRange = (
    status: OrderStatus | keyof typeof OrderStatus,
    range: DateRange
) => {
    const promise = API.graphql<Order[]>({
        query: getSales,
        variables: {
            status,
            from: range?.startDate.toISOString(),
            to: range?.endDate.toISOString(),
        },
    }) as Promise<GraphQLResult<{ getSales: Order[] }>>;

    return promise.then((r) => r.data?.getSales);
};
