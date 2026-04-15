import { Order, PaymentType, Product, OrderStatus } from '@pos/shared/models';

const round = (value: number) => Math.round(value * 100) / 100;
const money = (value: number) => `$${round(value).toFixed(2)}`;

const parseDiscountSummary = (value: string | null | undefined) => {
    if (!value) return undefined;
    try {
        return JSON.parse(value) as {
            applications?: Array<{
                definitionId?: string;
                definitionName?: string;
                name?: string;
                amount?: number;
            }>;
        };
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

export const buildPaymentSummaryRows = (orders: Order[]) => {
    const totals = new Map<string, { amount: number; count: number }>();

    orders.forEach((order) => {
        (order.paymentInfo?.payments || []).forEach((payment) => {
            const rawType = String(payment?.type || '').toUpperCase();
            const type =
                rawType === PaymentType.CC
                    ? 'Cards'
                    : rawType === PaymentType.CASH
                    ? 'Cash'
                    : rawType === PaymentType.EBT
                    ? 'EBT'
                    : rawType === PaymentType.CHECK
                    ? 'Checks'
                    : rawType || 'Other';
            const current = totals.get(type) || { amount: 0, count: 0 };
            current.amount += Number(payment?.amount || 0);
            current.count += 1;
            totals.set(type, current);
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
                current.amount += Number(app.amount || 0);
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

export const buildRefundReportRows = (orders: Order[]) =>
    orders
        .filter((order) => order.status === OrderStatus.REFUNDED)
        .map((order) => ({
            orderNo: order.orderNo,
            date: (order.updatedAt || order.orderDate || '').substring(0, 10),
            employee: order.refundInfo?.employeeName || order.employeeName || 'Unknown',
            amount: Number(order.total || 0),
            reason: order.refundInfo?.comments || '-',
        }))
        .sort((a, b) => (a.date < b.date ? 1 : -1));

export const buildRefundInsights = (orders: Order[]) => {
    const refundedOrders = orders.filter((order) => order.status === OrderStatus.REFUNDED);
    const byEmployee = new Map<string, number>();
    const byProduct = new Map<string, number>();
    const byReason = new Map<string, number>();

    let totalAmount = 0;

    refundedOrders.forEach((order) => {
        const amount = Number(order.total || 0);
        const employee = order.refundInfo?.employeeName || order.employeeName || 'Unknown';
        const reason = (order.refundInfo?.comments || '').trim();

        totalAmount += amount;
        byEmployee.set(employee, (byEmployee.get(employee) || 0) + amount);

        if (reason) {
            byReason.set(reason, (byReason.get(reason) || 0) + 1);
        }

        (order.lines || []).forEach((line) => {
            const product = line?.productName || 'Unknown';
            byProduct.set(product, (byProduct.get(product) || 0) + getOrderLineSalesAmount(line));
        });
    });

    const toRankedList = (map: Map<string, number>, formatter = money) =>
        Array.from(map.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({ name, value: formatter(value) }));

    return {
        totalAmount,
        totalOrders: refundedOrders.length,
        averageAmount: refundedOrders.length ? totalAmount / refundedOrders.length : 0,
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
