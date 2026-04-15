import { ProductEntity } from '@pos/products/data-access';
import { EmployeeEntity } from '@pos/employees/data-access';
import { Order } from '@pos/shared/models';

export const getEmployeeItems = (employees: EmployeeEntity[]) => {
    if (!employees) return [];

    const items = employees
        .map(e => ({ label: `${e.firstName} ${e.lastName}`, value: e.id }))
        .sort((left, right) => left.label.localeCompare(right.label, undefined, { sensitivity: 'base' }));
    items.unshift({ label: 'All', value: '' });

    return items;
}

export const getProductItems = (products: ProductEntity[]) => {
    if (!products) return [];

    const items = products
        .map(p => ({ label: p.name, value: p.id }))
        .sort((left, right) => left.label.localeCompare(right.label, undefined, { sensitivity: 'base' }));
    items.unshift({ label: 'All', value: '' });

    return items;
}

export interface OrdersFilterRequest {
    openedBy?: null | undefined | string;
    closedBy?: null | undefined | string;
    productId?: null | undefined | string;
}

export interface PaymentMethodsSummary {
    CC: number;
    CASH: number;
    CHECK: number;
    EBT: number;
}

export const filterOrders = (orders: Order[], request: OrdersFilterRequest) => {
    const filtered = orders.filter(o => {
        const openedById = o.createdBy?.id || o.employeeId;
        if (request.openedBy && openedById !== request.openedBy) return false;
        if (request.closedBy && o.paymentInfo?.employeeId !== request.closedBy) return false;

        if (!request.productId) return true;

        return o.lines.some(p => p?.productId === request.productId);
    });

    const summary = filtered.reduce(
        (acc, order) => {
            order.paymentInfo?.payments?.forEach((payment) => {
                const type = String(payment?.type || '').toUpperCase() as keyof PaymentMethodsSummary;
                if (!(type in acc)) return;
                acc[type] += Number(payment?.amount || 0);
            });

            return acc;
        },
        { CC: 0, CASH: 0, CHECK: 0, EBT: 0 } as PaymentMethodsSummary
    );

    const totalAmount = filtered.reduce((sum, order) => sum + Number(order.total || 0), 0);

    return {
        orders: filtered,
        summary,
        totalAmount,
    };
}
