import { ProductEntity } from '@pos/products/data-access';
import { EmployeeEntity } from '@pos/employees/data-access';
import { CategoryEntity } from '@pos/categories/data-access';

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