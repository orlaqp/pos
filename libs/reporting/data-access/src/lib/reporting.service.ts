import { GraphQLResult } from '@aws-amplify/api-graphql';
import { getSalesSummary } from '@pos/shared/api';
import { Order, OrderStatus, SalesSummary } from '@pos/shared/models';
import { DateRange } from '@pos/shared/ui-native';
import { API, DataStore } from 'aws-amplify';

const toIsoRange = (range: DateRange) => ({
    from: range?.startDate.toISOString(),
    to: range?.endDate.toISOString(),
});

const isWithinIsoRange = (value: string | null | undefined, from: string, to: string) =>
    !!value && value >= from && value <= to;

const getOrderEventIso = (
    order: Pick<Order, 'orderDate' | 'updatedAt'>,
    status: OrderStatus | keyof typeof OrderStatus
) => {
    // For paid sales views, use payment-time approximation (updatedAt).
    if (status === 'PAID') {
        return order.updatedAt || order.orderDate;
    }

    return order.orderDate || order.updatedAt;
};

export const hasSummaryData = (summary?: SalesSummary) =>
    !!summary && ((summary.totalAmount || 0) > 0 || (summary.totalOrders || 0) > 0);

export const buildSalesSummaryFromOrders = (
    orders: Order[],
    status: OrderStatus | keyof typeof OrderStatus = OrderStatus.PAID
): SalesSummary => {
    const byEmployee: Record<string, { employeeId: string; employeeName: string; orders: number; amount: number }> = {};
    const byProduct: Record<string, { productId: string; productName: string; unitOfMeasure: string; quantity: number; amount: number }> = {};
    const byDate: Record<string, { datePart: string; orders: number; amount: number }> = {};

    orders.forEach((order) => {
        const employeeId = order.employeeId || 'unknown';
        const employeeName = order.employeeName || 'Unknown';
        const total = Number(order.total || 0);
        const eventIso = getOrderEventIso(order, status) || '';
        const datePart = eventIso.substring(0, 10);

        if (datePart) {
            byDate[datePart] = byDate[datePart] || {
                datePart,
                orders: 0,
                amount: 0,
            };
            byDate[datePart].orders += 1;
            byDate[datePart].amount += total;
        }

        byEmployee[employeeId] = byEmployee[employeeId] || {
            employeeId,
            employeeName,
            orders: 0,
            amount: 0,
        };
        byEmployee[employeeId].orders += 1;
        byEmployee[employeeId].amount += total;

        (order.lines || []).forEach((line) => {
            if (!line?.productId) return;

            const amount = Number(line.price || 0) * Number(line.quantity || 0);
            byProduct[line.productId] = byProduct[line.productId] || {
                productId: line.productId,
                productName: line.productName || 'Unknown',
                unitOfMeasure: line.unitOfMeasure || '',
                quantity: 0,
                amount: 0,
            };
            byProduct[line.productId].quantity += Number(line.quantity || 0);
            byProduct[line.productId].amount += amount;
        });
    });

    const employees = Object.values(byEmployee);
    const products = Object.values(byProduct);
    const dates = Object.values(byDate).sort((a, b) =>
        a.datePart > b.datePart ? 1 : a.datePart < b.datePart ? -1 : 0
    );
    const totalAmount = employees.reduce((sum, item) => sum + item.amount, 0);
    const totalOrders = employees.reduce((sum, item) => sum + item.orders, 0);

    return {
        employees: employees as unknown as SalesSummary['employees'],
        products: products as unknown as SalesSummary['products'],
        dates: dates as unknown as SalesSummary['dates'],
        totalAmount,
        totalOrders,
    };
};

const getLocalPaidOrdersForRange = async (
    status: OrderStatus | keyof typeof OrderStatus,
    range: DateRange
) => {
    const normalizedStatus = status as OrderStatus;
    const { from, to } = toIsoRange(range);
    const orders = await DataStore.query(Order, (o) => o.status('eq', normalizedStatus));

    return orders.filter((order) =>
        isWithinIsoRange(getOrderEventIso(order, normalizedStatus), from, to)
    );
};

export const getSalesSummaryForRange = (
    status: OrderStatus | keyof typeof OrderStatus,
    range: DateRange
) => {
    const { from, to } = toIsoRange(range);
    const promise = API.graphql<SalesSummary>({
        query: getSalesSummary,
        variables: {
            status,
            from,
            to,
        },
    }) as Promise<GraphQLResult<{ getSalesSummary: SalesSummary }>>;

    return promise
        .then(async (r) => {
            const summary = r.data?.getSalesSummary;
            if (hasSummaryData(summary)) {
                return summary;
            }

            const localOrders = await getLocalPaidOrdersForRange(status, range);
            if (!localOrders.length) {
                return summary;
            }
            return buildSalesSummaryFromOrders(localOrders, status);
        })
        .catch(async () => {
            const localOrders = await getLocalPaidOrdersForRange(status, range);
            if (!localOrders.length) {
                return undefined;
            }
            return buildSalesSummaryFromOrders(localOrders, status);
        });
};

export const getSalesForRange = (
    status: OrderStatus | keyof typeof OrderStatus,
    range: DateRange
) => {
    const { from, to } = toIsoRange(range);
    const promise = API.graphql<Order[]>({
        query: getSalesCustom,
        variables: {
            status,
            from,
            to,
        },
    }) as Promise<GraphQLResult<{ getSales: Order[] }>>;

    return promise
        .then(async (r) => {
            const remoteOrders = r.data?.getSales || [];
            if (remoteOrders.length) {
                return remoteOrders;
            }
            return getLocalPaidOrdersForRange(status, range);
        })
        .catch(async () => getLocalPaidOrdersForRange(status, range));
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
