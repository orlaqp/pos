import { GraphQLResult } from '@aws-amplify/api-graphql';
import { getSalesSummary } from '@pos/shared/api';
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
        query: getSalesCustom,
        variables: {
            status,
            from: range?.startDate.toISOString(),
            to: range?.endDate.toISOString(),
        },
    }) as Promise<GraphQLResult<{ getSales: Order[] }>>;

    return promise.then((r) => r.data?.getSales);
};

export const getSalesCustom = /* GraphQL */ `
  query GetSales($status: OrderStatus!, $from: String!, $to: String!) {
    getSales(status: $status, from: $from, to: $to) {
      id
      orderNo
      orderDate
      subtotal
      tax
      total
      status
      employeeId
      employeeName
      lines {
        identifier
        productId
        productName
        unitOfMeasure
        barcode
        sku
        quantity
        tax
        price
      }
      paymentInfo {
        employeeId
        employeeName
        payments {
            type
            amount
        }
      }
      refundInfo {
        employeeId
        employeeName
        comments
      }
      createdBy {
        id
        name
      }
      updatedBy {
        id
        name
      }
      Customer {
        id
        firstName
        lastName
        middleName
        dob
        phone
        email
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      orderCustomerId
    }
  }
`;
