import {
    Order,
    OrderRefund,
    OrderRefundLine,
    OrderStatus,
    PaymentType,
    Product,
} from '@pos/shared/models';

const round = (value: number) => Math.round(value * 100) / 100;
const money = (value: number) => `$${round(value).toFixed(2)}`;
const PAYMENT_TYPE_LABELS: Record<string, string> = {
    [PaymentType.CC]: 'Cards',
    [PaymentType.CASH]: 'Cash',
    [PaymentType.EBT]: 'EBT',
    [PaymentType.CHECK]: 'Checks',
};

type DiscountApplicationSummary = {
    definitionId?: string;
    definitionName?: string;
    name?: string;
    amount?: number;
    discountAmount?: number;
};

type ParsedDiscountSummary = {
    applications?: DiscountApplicationSummary[];
};

const normalizeDiscountSummary = (value: unknown): ParsedDiscountSummary | undefined => {
    if (!value || typeof value !== 'object') {
        return undefined;
    }

    const applications = Array.isArray((value as { applications?: unknown }).applications)
        ? ((value as { applications: unknown[] }).applications
              .map((app) => {
                  if (!app || typeof app !== 'object') return undefined;
                  const typed = app as Record<string, unknown>;
                  return {
                      definitionId:
                          typeof typed.definitionId === 'string'
                              ? typed.definitionId
                              : typeof typed.discountDefinitionId === 'string'
                              ? typed.discountDefinitionId
                              : undefined,
                      definitionName:
                          typeof typed.definitionName === 'string'
                              ? typed.definitionName
                              : undefined,
                      name:
                          typeof typed.name === 'string' ? typed.name : undefined,
                      amount:
                          typeof typed.amount === 'number'
                              ? typed.amount
                              : typeof typed.discountAmount === 'number'
                              ? typed.discountAmount
                              : undefined,
                      discountAmount:
                          typeof typed.discountAmount === 'number'
                              ? typed.discountAmount
                              : undefined,
                  };
              })
              .filter(Boolean) as DiscountApplicationSummary[])
        : [];

    return { applications };
};

const parseDiscountSummary = (value: unknown) => {
    if (!value) return undefined;
    if (typeof value === 'object') {
        return normalizeDiscountSummary(value);
    }
    try {
        return normalizeDiscountSummary(JSON.parse(String(value)));
    } catch {
        return undefined;
    }
};

export const getOrderLineSalesAmount = (line: NonNullable<Order['lines']>[number]) =>
    Number(line?.lineTotalBeforeTax ?? Number(line?.price || 0) * Number(line?.quantity || 0));

export const buildCategoryPerformanceRows = (
    orders: Order[],
    categoriesById: Record<string, string>
) => {
    const totals = new Map<string, { sales: number; units: number }>();

    orders.forEach((order) => {
        (order.lines || []).forEach((line) => {
            const categoryId = line?.categoryId || 'unknown';
            const current = totals.get(categoryId) || { sales: 0, units: 0 };
            current.sales += getOrderLineSalesAmount(line);
            current.units += Number(line?.quantity || 0);
            totals.set(categoryId, current);
        });
    });

    return Array.from(totals.entries())
        .map(([categoryId, value]) => ({
            category: categoriesById[categoryId] || 'Unknown',
            sales: value.sales,
            units: round(value.units),
        }))
        .sort((a, b) => b.sales - a.sales)
        .map((item) => ({
            category: item.category,
            sales: item.sales,
            units: item.units,
        }));
};

const toPaymentLabel = (type: string | undefined | null) => {
    const rawType = String(type || '').toUpperCase();
    return PAYMENT_TYPE_LABELS[rawType] || rawType || 'Other';
};

const addPaymentAmount = (
    totals: Map<string, { amount: number; count: number }>,
    type: string | undefined | null,
    amount: number,
    countDelta: number
) => {
    const label = toPaymentLabel(type);
    if (!label || amount === 0) {
        return;
    }

    const current = totals.get(label) || { amount: 0, count: 0 };
    current.amount = round(current.amount + amount);
    current.count += countDelta;
    totals.set(label, current);
};

const allocateRefundAcrossOrderPayments = (
    order: Order | undefined,
    refundAmount: number
) => {
    const payments = (order?.paymentInfo?.payments || [])
        .map((payment) => ({
            type: String(payment?.type || '').toUpperCase(),
            amount: round(Math.max(0, Number(payment?.amount || 0))),
        }))
        .filter((payment) => payment.amount > 0);

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    if (refundAmount <= 0 || totalPaid <= 0) {
        return [] as Array<{ type: string; amount: number }>;
    }

    let remaining = Math.min(round(refundAmount), round(totalPaid));

    return payments
        .map((payment, index) => {
            if (remaining <= 0) {
                return { ...payment, amount: 0 };
            }

            const allocated =
                index === payments.length - 1
                    ? remaining
                    : round((payment.amount / totalPaid) * refundAmount);
            const capped = Math.min(payment.amount, allocated, remaining);
            remaining = round(remaining - capped);
            return {
                type: payment.type,
                amount: capped,
            };
        })
        .filter((payment) => payment.amount > 0);
};

export const buildPaymentSummaryRows = (orders: Order[], refunds: OrderRefund[] = []) => {
    const totals = new Map<string, { amount: number; count: number }>();
    const ordersById = new Map<string, Order>();

    orders.forEach((order) => {
        ordersById.set(String(order.id), order);
        (order.paymentInfo?.payments || []).forEach((payment) => {
            addPaymentAmount(
                totals,
                payment?.type,
                Number(payment?.amount || 0),
                1
            );
        });
    });

    refunds.forEach((refund) => {
        const explicitRefundPayments = (refund.refundPayments || [])
            .map((payment) => ({
                type: String(payment?.type || '').toUpperCase(),
                amount: round(Math.max(0, Number(payment?.amount || 0))),
            }))
            .filter((payment) => payment.amount > 0);

        const paymentsToSubtract = explicitRefundPayments.length
            ? explicitRefundPayments
            : allocateRefundAcrossOrderPayments(
                  ordersById.get(String(refund.orderId || '')),
                  Number(refund.refundAmount || 0)
              );

        paymentsToSubtract.forEach((payment) => {
            addPaymentAmount(totals, payment.type, -1 * payment.amount, 0);
        });
    });

    const totalAmount = Array.from(totals.values()).reduce((sum, item) => sum + item.amount, 0);

    return Array.from(totals.entries())
        .map(([type, value]) => ({
            paymentType: type,
            amount: value.amount,
            count: value.count,
            percent: totalAmount ? `${Math.round((value.amount / totalAmount) * 100)}%` : '0%',
        }))
        .sort((a, b) => b.amount - a.amount);
};

export const buildDiscountReportRows = (orders: Order[]) => {
    const totals = new Map<string, { amount: number; orders: number }>();

    orders.forEach((order) => {
        const summary = parseDiscountSummary(order.appliedDiscountSummary);
        const apps = summary?.applications || [];

        if (apps.length) {
            const seen = new Set<string>();
            apps.forEach((app) => {
                const name =
                    app.name || app.definitionName || app.definitionId || 'Unknown discount';
                const current = totals.get(name) || { amount: 0, orders: 0 };
                current.amount += Number(app.amount ?? app.discountAmount ?? 0);
                if (!seen.has(name)) {
                    current.orders += 1;
                    seen.add(name);
                }
                totals.set(name, current);
            });
            return;
        }

        const fallbackDiscount = Number(order.discountTotal || 0);
        if (fallbackDiscount > 0) {
            const key = 'Unclassified discount';
            const current = totals.get(key) || { amount: 0, orders: 0 };
            current.amount += fallbackDiscount;
            current.orders += 1;
            totals.set(key, current);
        }
    });

    return Array.from(totals.entries())
        .map(([discount, value]) => ({
            discount,
            amount: value.amount,
            orders: value.orders,
        }))
        .sort((a, b) => b.amount - a.amount);
};

export const buildRefundReportRows = (refunds: OrderRefund[]) =>
    refunds
        .map((refund) => ({
            orderNo: refund.orderNo,
            date: (refund.refundDate || '').substring(0, 10),
            employee: refund.createdByEmployeeName || 'Unknown',
            amount: Number(refund.refundAmount || 0),
            reason: refund.refundReason || '-',
        }))
        .sort((a, b) => (a.date < b.date ? 1 : -1));

export const buildRefundInsights = (
    refunds: OrderRefund[],
    refundLines: OrderRefundLine[]
) => {
    const byEmployee = new Map<string, number>();
    const byProduct = new Map<string, number>();
    const byReason = new Map<string, number>();

    let totalAmount = 0;

    refunds.forEach((refund) => {
        const amount = Number(refund.refundAmount || 0);
        const employee = refund.createdByEmployeeName || 'Unknown';
        const reason = (refund.refundReason || '').trim();

        totalAmount += amount;
        byEmployee.set(employee, (byEmployee.get(employee) || 0) + amount);

        if (reason) {
            byReason.set(reason, (byReason.get(reason) || 0) + 1);
        }

    });

    refundLines.forEach((line) => {
        const product = line?.productName || 'Unknown';
        byProduct.set(
            product,
            (byProduct.get(product) || 0) + Number(line?.lineRefundAmount || 0)
        );
    });

    const toRankedList = (map: Map<string, number>, formatter = money) =>
        Array.from(map.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({ name, value: formatter(value) }));

    return {
        totalAmount,
        totalOrders: refunds.length,
        averageAmount: refunds.length ? totalAmount / refunds.length : 0,
        topEmployees: toRankedList(byEmployee),
        topProducts: toRankedList(byProduct),
        reasons: Array.from(byReason.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({ name, value: `${value}` })),
    };
};

export const buildHourlySalesRows = (orders: Order[]) => {
    const totals = new Map<string, { amount: number; orders: number }>();

    orders.forEach((order) => {
        const source = order.updatedAt || order.orderDate;
        if (!source) return;
        const hour = source.substring(11, 13);
        const key = `${hour}:00`;
        const current = totals.get(key) || { amount: 0, orders: 0 };
        current.amount += Number(order.total || 0);
        current.orders += 1;
        totals.set(key, current);
    });

    return Array.from(totals.entries())
        .map(([hour, value]) => ({
            hour,
            sales: value.amount,
            orders: value.orders,
            averageTicket: value.orders ? value.amount / value.orders : 0,
        }))
        .sort((a, b) => (a.hour > b.hour ? 1 : -1));
};

export const buildEbtSummaryRows = (orders: Order[]) => {
    let eligibleSales = 0;
    let ebtPaid = 0;
    let nonEbtPaid = 0;

    orders.forEach((order) => {
        (order.lines || []).forEach((line) => {
            if (line?.isEBTEligible) {
                eligibleSales += getOrderLineSalesAmount(line);
            }
            ebtPaid += Number(line?.ebtPaidAmount || 0);
            nonEbtPaid += Number(line?.nonEbtPaidAmount || 0);
        });
    });

    return [
        { metric: 'EBT Eligible Sales', amount: eligibleSales },
        { metric: 'EBT Tendered', amount: ebtPaid },
        { metric: 'Non-EBT Tendered', amount: nonEbtPaid },
    ];
};

export const buildOpenOrdersAgingRows = (orders: Order[], now = new Date()) =>
    orders
        .filter((order) => order.status === OrderStatus.OPEN)
        .map((order) => {
            const createdAt = order.orderDate ? new Date(order.orderDate) : now;
            const ageMinutes = Math.max(
                0,
                Math.round((now.getTime() - createdAt.getTime()) / 60000)
            );

            return {
                orderNo: order.orderNo,
                employee: order.employeeName || 'Unknown',
                total: Number(order.total || 0),
                ageMinutes,
                ageBucket:
                    ageMinutes < 15
                        ? '<15m'
                        : ageMinutes < 60
                        ? '15m-1h'
                        : ageMinutes < 240
                        ? '1h-4h'
                        : '4h+',
            };
        })
        .sort((a, b) => b.ageMinutes - a.ageMinutes);

export const buildLowSalesItemRows = (orders: Order[], products: Product[]) => {
    const sold = new Map<string, { quantity: number; amount: number }>();
    const catalog = new Map<string, { id: string; name: string }>();

    (products || []).forEach((product) => {
        if (!product?.id) return;
        catalog.set(product.id, {
            id: product.id,
            name: product.name || 'Unknown',
        });
    });

    orders.forEach((order) => {
        (order.lines || []).forEach((line) => {
            const productId = line?.productId;
            if (!productId) return;
            if (!catalog.has(productId)) {
                catalog.set(productId, {
                    id: productId,
                    name: line?.productName || 'Unknown',
                });
            }
            const current = sold.get(productId) || { quantity: 0, amount: 0 };
            current.quantity += Number(line?.quantity || 0);
            current.amount += getOrderLineSalesAmount(line);
            sold.set(productId, current);
        });
    });

    return Array.from(catalog.values())
        .map((product) => {
            const stats = sold.get(product.id) || { quantity: 0, amount: 0 };
            return {
                product: product.name || 'Unknown',
                quantity: round(stats.quantity),
                sales: stats.amount,
                status: stats.quantity === 0 ? 'No sales' : 'Low sales',
            };
        })
        .sort((a, b) => {
            if (a.quantity === 0 && b.quantity !== 0) return -1;
            if (a.quantity !== 0 && b.quantity === 0) return 1;
            if (a.quantity !== b.quantity) return a.quantity - b.quantity;
            return a.product.localeCompare(b.product, undefined, {
                sensitivity: 'base',
            });
        });
};

export const formatMoneyValue = money;
