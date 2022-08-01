import { ProductEntity } from '@pos/products/data-access';
import { EmployeeEntity } from '@pos/employees/data-access';
import { CategoryEntity } from '@pos/categories/data-access';
import { Order } from '@pos/shared/models';
import { request } from 'http';

export const getEmployeeItems = (employees: EmployeeEntity[]) => {
    if (!employees) return [];

    return employees.map(e => ({ label: `${e.firstName} ${e.lastName}`, value: e.id }));
}

export const getCategoryItems = (categories: CategoryEntity[]) => {
    if (!categories) return [];

    return categories.map(p => ({ label: p.name, value: p.id }));
}

export const getProductItems = (products: ProductEntity[]) => {
    if (!products) return [];

    return products.map(p => ({ label: p.name, value: p.id }));
}

export interface OrdersFilterRequest {
    employeeId?: null | undefined | string;
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
        if (request.employeeId && o.createdBy?.id !== request.employeeId) return false;
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
