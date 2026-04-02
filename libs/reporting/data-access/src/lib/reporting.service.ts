import { GraphQLResult } from '@aws-amplify/api-graphql';
import { getSalesSummary } from '@pos/shared/api';
import { Order, OrderStatus, SalesSummary } from '@pos/shared/models';
import { DateRange } from '@pos/shared/ui-native';
import { API } from '@pos/shared/amplify';

const toIsoRange = (range: DateRange) => ({
    from: range?.startDate.toISOString(),
    to: range?.endDate.toISOString(),
});

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
        const employeeId = order.createdBy?.id || order.employeeId || 'unknown';
        const employeeName = order.createdBy?.name || order.employeeName || 'Unknown';
        const total = Number(order.total || 0);
        const eventIso =
            status === 'PAID'
                ? order.updatedAt || order.orderDate || ''
                : order.orderDate || order.updatedAt || '';
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

export const getSalesSummaryForRange = (
    status: OrderStatus | keyof typeof OrderStatus,
    range: DateRange
) => {
    const { from, to } = toIsoRange(range);
    const promise = API.graphql<{ getSalesSummary: SalesSummary }>({
        query: getSalesSummary,
        variables: {
            status,
            from,
            to,
        },
    }) as Promise<GraphQLResult<{ getSalesSummary: SalesSummary }>>;

    return promise
        .then((r) => r.data?.getSalesSummary)
        .catch(async (error) => {
            console.error('getSalesSummaryForRange failed', {
                status,
                from,
                to,
                error,
            });
            return undefined;
        });
};

export const getSalesForRange = (
    status: OrderStatus | keyof typeof OrderStatus,
    range: DateRange
) => {
    const { from, to } = toIsoRange(range);
    const promise = API.graphql<{ getSales: Order[] }>({
        query: getSalesCustom,
        variables: {
            status,
            from,
            to,
        },
    }) as Promise<GraphQLResult<{ getSales: Order[] }>>;

    return promise
        .then((r) => r.data?.getSales || [])
        .catch(async (error) => {
            console.error('getSalesForRange failed', {
                status,
                from,
                to,
                error,
            });
            return [];
        });
};

export const getSalesCustom = /* GraphQL */ `
  query GetSales($status: OrderStatus!, $from: String!, $to: String!) {
    getSales(status: $status, from: $from, to: $to) {
      id
      orderNo
      orderDate
      updatedAt
      subtotal
      tax
      total
      status
      employeeId
      employeeName
      lines {
        productId
        productName
        categoryId
        unitOfMeasure
        quantity
        price
        lineTotalBeforeTax
        isEBTEligible
        ebtPaidAmount
        nonEbtPaidAmount
      }
      discountTotal
      appliedDiscountSummary
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
    }
  }
`;
