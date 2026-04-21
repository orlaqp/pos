import { GraphQLResult } from '@aws-amplify/api-graphql';
import { Order, OrderStatus, SalesSummary } from '@pos/shared/models';
import { DateRange } from '@pos/shared/ui-native';
import { API } from '@pos/shared/amplify';
import moment from 'moment';

const toIsoRange = (range: DateRange) => ({
    from: range?.startDate.toISOString(),
    to: range?.endDate.toISOString(),
});

const toStatusList = (
    statuses:
        | (OrderStatus | keyof typeof OrderStatus)
        | (OrderStatus | keyof typeof OrderStatus)[]
) => {
    const normalized = Array.isArray(statuses) ? statuses : [statuses];
    return normalized.filter(Boolean);
};

const isTransformationTooLargeError = (error: unknown) => {
    const message = JSON.stringify(error);
    return message.includes('Transformation too large');
};

const canSplitSalesRange = (range: DateRange) =>
    range.startDate.clone().startOf('day').isBefore(range.endDate.clone().endOf('day'));

const splitDateRangeForSales = (range: DateRange): [DateRange, DateRange] => {
    const start = range.startDate.clone().startOf('day');
    const end = range.endDate.clone().endOf('day');
    const midpoint = start
        .clone()
        .add(Math.floor(end.diff(start, 'days') / 2), 'days')
        .endOf('day');

    return [
        {
            startDate: start,
            endDate: midpoint,
        },
        {
            startDate: midpoint.clone().add(1, 'millisecond'),
            endDate: end,
        },
    ];
};

const mergeOrdersById = (orders: Order[][]) => {
    const byId = new Map<string, Order>();

    orders.flat().forEach((order) => {
        if (!order?.id) return;
        byId.set(order.id, order);
    });

    return Array.from(byId.values()).sort((a, b) => {
        const left = a.updatedAt || a.orderDate || '';
        const right = b.updatedAt || b.orderDate || '';
        return left > right ? -1 : left < right ? 1 : 0;
    });
};

const fetchSalesChunk = async (
    statuses:
        | (OrderStatus | keyof typeof OrderStatus)
        | (OrderStatus | keyof typeof OrderStatus)[],
    range: DateRange
) => {
    const { from, to } = toIsoRange(range);
    const normalizedStatuses = toStatusList(statuses);
    const promise = API.graphql<{ getSales: Order[] }>({
        query: getSalesCustom,
        variables: {
            statuses: normalizedStatuses,
            from,
            to,
        },
    }) as Promise<GraphQLResult<{ getSales: Order[] }>>;

    return promise.then((r) => r.data?.getSales || []);
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
    statuses:
        | (OrderStatus | keyof typeof OrderStatus)
        | (OrderStatus | keyof typeof OrderStatus)[],
    range: DateRange
) => {
    const { from, to } = toIsoRange(range);
    const normalizedStatuses = toStatusList(statuses);
    const promise = API.graphql<{ getSalesSummary: SalesSummary }>({
        query: getSalesSummaryCustom,
        variables: {
            statuses: normalizedStatuses,
            from,
            to,
        },
    }) as Promise<GraphQLResult<{ getSalesSummary: SalesSummary }>>;

    return promise
        .then((r) => r.data?.getSalesSummary)
        .catch(async (error) => {
            console.error('getSalesSummaryForRange failed', {
                statuses: normalizedStatuses,
                from,
                to,
                error,
            });
            return undefined;
        });
};

export const getSalesForRange = (
    statuses:
        | (OrderStatus | keyof typeof OrderStatus)
        | (OrderStatus | keyof typeof OrderStatus)[],
    range: DateRange
) => {
    const normalizedStatuses = toStatusList(statuses);
    return fetchSalesChunk(normalizedStatuses, range).catch(async (error) => {
        if (isTransformationTooLargeError(error) && canSplitSalesRange(range)) {
            const [left, right] = splitDateRangeForSales(range);
            const [leftOrders, rightOrders] = await Promise.all([
                getSalesForRange(normalizedStatuses, left),
                getSalesForRange(normalizedStatuses, right),
            ]);

            return mergeOrdersById([leftOrders, rightOrders]);
        }

        const { from, to } = toIsoRange(range);
        console.error('getSalesForRange failed', {
            statuses: normalizedStatuses,
            from,
            to,
            error,
        });
        return [];
    });
};

export const getSalesCustom = /* GraphQL */ `
  query GetSales($statuses: [OrderStatus!]!, $from: String!, $to: String!) {
    getSales(statuses: $statuses, from: $from, to: $to) {
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
        identifier
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
      appliedDiscountSummary {
        applications {
          discountApplicationId
          discountDefinitionId
          applicationType
          scope
          method
          name
          code
          stackMode
          source
          value
          originalAmount
          discountAmount
          finalAmount
          quantityBasis
          reasonCode
          reasonNote
          appliedByEmployeeId
          appliedByEmployeeName
          approvedByEmployeeId
          approvedByEmployeeName
          approvalRequired
          approvalStatus
          approvalReference
          sourceSnapshot
          appliedAt
        }
        approvalEvents {
          id
          approvalType
          requestingEmployeeId
          approvingEmployeeId
          requestedAction
          reasonCode
          reasonNote
          policySnapshot
          status
          createdAt
        }
        lineSummaries {
          lineId
          discounts {
            discountApplicationId
            discountDefinitionId
            applicationType
            scope
            method
            name
            code
            stackMode
            source
            value
            originalAmount
            discountAmount
            finalAmount
            quantityBasis
            reasonCode
            reasonNote
            appliedByEmployeeId
            appliedByEmployeeName
            approvedByEmployeeId
            approvedByEmployeeName
            approvalRequired
            approvalStatus
            approvalReference
            sourceSnapshot
            appliedAt
          }
          lineDiscountTotal
          allocatedOrderDiscountTotal
          lineTotalBeforeTax
        }
        orderLevelAdjustments {
          discountApplicationId
          discountDefinitionId
          applicationType
          scope
          method
          name
          code
          stackMode
          source
          value
          originalAmount
          discountAmount
          finalAmount
          quantityBasis
          reasonCode
          reasonNote
          appliedByEmployeeId
          appliedByEmployeeName
          approvedByEmployeeId
          approvedByEmployeeName
          approvalRequired
          approvalStatus
          approvalReference
          sourceSnapshot
          appliedAt
        }
        warnings
        pricingGeneratedAt
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
    }
  }
`;

export const getSalesSummaryCustom = /* GraphQL */ `
  query GetSalesSummary($statuses: [OrderStatus!]!, $from: String!, $to: String!) {
    getSalesSummary(statuses: $statuses, from: $from, to: $to) {
      products {
        productId
        productName
        unitOfMeasure
        quantity
        amount
      }
      employees {
        employeeId
        employeeName
        orders
        amount
      }
      dates {
        datePart
        orders
        amount
      }
      totalAmount
      totalOrders
    }
  }
`;
