import { ProductEntity } from '@pos/products/data-access';
import { EmployeeEntity } from '@pos/employees/data-access';
import { Order } from '@pos/shared/models';

export const getEmployeeItems = (employees: EmployeeEntity[]) => {
    if (!employees) return [];

    const items = employees.map(e => ({ label: `${e.firstName} ${e.lastName}`, value: e.id }));
    items.unshift({ label: 'All', value: '' });

    return items;
}

export const getProductItems = (products: ProductEntity[]) => {
    if (!products) return [];

    const items = products.map(p => ({ label: p.name, value: p.id }));
    items.unshift({ label: 'All', value: '' });

    return items;
}

export interface OrdersFilterRequest {
    openedBy?: null | undefined | string;
    closedBy?: null | undefined | string;
    productId?: string;
}

export interface PaymentMethodsSummary {
    CC: number;
    CASH: number;
    CHECK: number;
}

export const filterOrders = (orders: Order[], request: OrdersFilterRequest) => {
    const summary: PaymentMethodsSummary = { CC: 0, CASH: 0, CHECK: 0 };

    const filtered = orders.filter(o => {
        if (request.openedBy && o.createdBy?.id !== request.openedBy) return false;
        if (request.closedBy && o.paymentInfo?.employeeId !== request.closedBy) return false;
        // if (request.productId && o.createdBy?.id !== request.employeeId) return false;
        
        o.paymentInfo?.payments?.forEach(p => {
            summary[p?.type] += p?.amount;
        });
        
        return true;
    });   

    return {
        orders: filtered,
        summary
    };
}
