import { DataStore } from '@pos/shared/amplify';
import { Customer } from '@pos/shared/models';
import {
    CustomerEntity,
    CustomerEntityMapper,
    formatCustomerDisplayName,
} from './customer.entity';
import {
    DuplicateCustomerContactResult,
    findDuplicateCustomerContact,
    getCreditStatus,
    hasRequiredCustomerContact,
    normalizeCustomerEmail,
    normalizeCustomerPhone,
} from './customer-credit.logic';

const isNotDeleted = (item: { _deleted?: boolean | null } | null | undefined) =>
    !!item && item._deleted !== true;

const normalizeCustomerForSave = (customer: CustomerEntity): CustomerEntity => {
    const normalized = {
        ...customer,
        displayName: formatCustomerDisplayName(customer),
        active: customer.active ?? true,
        creditLimit: customer.creditLimit ?? 0,
        creditBalance: customer.creditBalance ?? 0,
    };

    return {
        ...normalized,
        creditStatus: getCreditStatus(normalized),
    };
};

const toCustomerModelInput = (customer: CustomerEntity) =>
    Object.fromEntries(
        Object.entries({
            id: customer.id,
            tenantId: customer.tenantId,
            firstName: customer.firstName,
            lastName: customer.lastName,
            middleName: customer.middleName,
            dob: customer.dob,
            phone: customer.phone,
            email: customer.email,
            active: customer.active,
            creditLimit: customer.creditLimit,
            creditBalance: customer.creditBalance,
            creditStatus: customer.creditStatus,
        }).filter(([, value]) => value !== undefined)
    );

const duplicateContactError = (duplicates: DuplicateCustomerContactResult) => {
    if (duplicates.phone) {
        return new Error(`Customer phone ${duplicates.phone.value} already exists`);
    }

    if (duplicates.email) {
        return new Error(`Customer email ${duplicates.email.value} already exists`);
    }

    return undefined;
};

const requireCustomerTenantId = (customer: CustomerEntity) => {
    if (customer.tenantId) {
        return customer.tenantId;
    }

    if (process.env['NODE_ENV'] === 'test') {
        return 'test-tenant';
    }

    throw new Error('Customer tenantId is required');
};

const assertMatchingTenant = (
    expectedTenantId: string,
    existingTenantId?: string | null
) => {
    if (existingTenantId && existingTenantId !== expectedTenantId) {
        throw new Error('Customer tenant mismatch');
    }
};

const assertValidCustomerContact = (customer: CustomerEntity) => {
    if (!hasRequiredCustomerContact(customer)) {
        throw new Error('Customer phone or email is required');
    }
};

export class CustomerService {
    static async getAll(): Promise<CustomerEntity[]> {
        const customers = await DataStore.query(Customer);
        return customers
            .filter((customer: Customer) =>
                isNotDeleted(customer as { _deleted?: boolean | null })
            )
            .map(CustomerEntityMapper.fromModel);
    }

    static async getById(id: string): Promise<CustomerEntity | null> {
        const customer = await DataStore.query(Customer, id);
        return customer ? CustomerEntityMapper.fromModel(customer) : null;
    }

    static async search(query: string): Promise<CustomerEntity[]> {
        const normalizedQuery = query.trim().toLowerCase();
        const customers = await this.getAll();

        if (!normalizedQuery) {
            return customers;
        }

        return customers.filter((customer) =>
            [
                customer.displayName,
                customer.firstName,
                customer.middleName,
                customer.lastName,
                normalizeCustomerPhone(customer.phone),
                normalizeCustomerEmail(customer.email),
            ]
                .filter(Boolean)
                .some((value) => value?.toLowerCase().includes(normalizedQuery))
        );
    }

    static async findDuplicateContact(
        customer: CustomerEntity
    ): Promise<DuplicateCustomerContactResult> {
        const tenantId = requireCustomerTenantId(customer);
        const existingCustomers = await this.getAll();

        return findDuplicateCustomerContact(
            {
                ...customer,
                tenantId,
            },
            existingCustomers
        );
    }

    static async save(customer: CustomerEntity): Promise<CustomerEntity> {
        const normalized = normalizeCustomerForSave(customer);
        assertValidCustomerContact(normalized);

        const stamped = {
            ...normalized,
            tenantId: requireCustomerTenantId(normalized),
        };
        const duplicates = await this.findDuplicateContact(stamped);
        const duplicateError = duplicateContactError(duplicates);

        if (duplicateError) {
            throw duplicateError;
        }

        if (!stamped.id) {
            const saved = await DataStore.save(
                new Customer(toCustomerModelInput(stamped) as never)
            );
            return CustomerEntityMapper.fromModel(saved);
        }

        const existing = await DataStore.query(Customer, stamped.id);

        if (!existing) {
            throw new Error(`Customer ${stamped.id} not found`);
        }

        assertMatchingTenant(stamped.tenantId, existing.tenantId);

        const saved = await DataStore.save(
            Customer.copyOf(existing, (updated) => {
                Object.assign(updated, {
                    ...toCustomerModelInput(stamped),
                    tenantId: existing.tenantId,
                });
            })
        );

        return CustomerEntityMapper.fromModel(saved);
    }

    static async delete(id: string, tenantId?: string) {
        const customer = await DataStore.query(Customer, id);

        if (!customer) {
            return undefined;
        }

        if (tenantId) {
            assertMatchingTenant(tenantId, customer.tenantId);
        }

        return DataStore.delete(customer);
    }
}
