import { GraphQLResult } from '@aws-amplify/api-graphql';
import { getSalesSummary } from '@pos/shared/api';
import { SalesSummary } from '@pos/shared/models';
import { DateRange } from '@pos/shared/ui-native';
import { API } from 'aws-amplify';

export const getSalesSummaryForRange = (range: DateRange) => {
    const promise = API.graphql<SalesSummary>({
        query: getSalesSummary,
        variables: {
            from: range?.startDate.toISOString(),
            to: range?.endDate.toISOString(),
        },
    }) as Promise<GraphQLResult<{ getSalesSummary: SalesSummary }>>;

    return promise.then(r => r.data?.getSalesSummary);
}