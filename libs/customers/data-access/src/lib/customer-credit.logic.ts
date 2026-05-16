import { CustomerEntity, CreditTransactionEntity } from './customer.entity';
import { CustomerCreditStatus } from '@pos/shared/models';

export type CustomerCreditUseReason =
    | 'ALLOWED'
    | 'NO_CUSTOMER'
    | 'INACTIVE_CUSTOMER'
    | 'INVALID_AMOUNT'
    | 'INSUFFICIENT_CREDIT';

export type CustomerCreditUseResult = {
    allowed: boolean;
    reason: CustomerCreditUseReason;
};

export type DuplicateContactField = 'phone' | 'email';

export type DuplicateCustomerContact = {
    field: DuplicateContactField;
    customerId?: string;
    value: string;
    customer?: CustomerEntity;
};

export type DuplicateCustomerContactResult = Partial<
    Record<DuplicateContactField, DuplicateCustomerContact>
>;

export type CustomerCreditSnapshot = {
    customer?: CustomerEntity;
    transactions: CreditTransactionEntity[];
};

export const buildCustomerCreditSnapshot = (
    customer?: CustomerEntity,
    transactions: CreditTransactionEntity[] = []
): CustomerCreditSnapshot => ({
    customer,
    transactions,
});

export const coalesceCreditAmount = (value?: number | null) => value ?? 0;

export const normalizeCustomerEmail = (email?: string | null) =>
    email?.trim().toLowerCase() || undefined;

export const normalizeCustomerPhone = (phone?: string | null) =>
    phone?.replace(/\D/g, '') || undefined;

export const getAvailableCredit = (customer: Pick<CustomerEntity, 'creditLimit' | 'creditBalance'>) =>
    coalesceCreditAmount(customer.creditLimit) - coalesceCreditAmount(customer.creditBalance);

export const getCreditStatus = (customer: Pick<CustomerEntity, 'creditLimit' | 'creditBalance'>) =>
    coalesceCreditAmount(customer.creditBalance) > coalesceCreditAmount(customer.creditLimit)
        ? CustomerCreditStatus.OVER_LIMIT
        : CustomerCreditStatus.OK;

export const hasRequiredCustomerContact = (
    customer: Pick<CustomerEntity, 'phone' | 'email'>
) => !!normalizeCustomerPhone(customer.phone) || !!normalizeCustomerEmail(customer.email);

export const canUseCustomerCredit = (
    customer: CustomerEntity | null | undefined,
    amount: number
): CustomerCreditUseResult => {
    if (!customer) {
        return { allowed: false, reason: 'NO_CUSTOMER' };
    }

    if ((customer.active ?? true) !== true) {
        return { allowed: false, reason: 'INACTIVE_CUSTOMER' };
    }

    if (amount <= 0) {
        return { allowed: false, reason: 'INVALID_AMOUNT' };
    }

    if (amount > getAvailableCredit(customer)) {
        return { allowed: false, reason: 'INSUFFICIENT_CREDIT' };
    }

    return { allowed: true, reason: 'ALLOWED' };
};

export const findDuplicateCustomerContact = (
    customer: CustomerEntity,
    existingCustomers: CustomerEntity[]
): DuplicateCustomerContactResult => {
    const phone = normalizeCustomerPhone(customer.phone);
    const email = normalizeCustomerEmail(customer.email);
    const result: DuplicateCustomerContactResult = {};

    for (const existing of existingCustomers) {
        if (customer.id && existing.id === customer.id) {
            continue;
        }

        if (customer.tenantId && existing.tenantId && existing.tenantId !== customer.tenantId) {
            continue;
        }

        if (!result.phone && phone && normalizeCustomerPhone(existing.phone) === phone) {
            result.phone = {
                field: 'phone',
                customerId: existing.id,
                value: phone,
                customer: existing,
            };
        }

        if (!result.email && email && normalizeCustomerEmail(existing.email) === email) {
            result.email = {
                field: 'email',
                customerId: existing.id,
                value: email,
                customer: existing,
            };
        }

        if (result.phone && result.email) {
            break;
        }
    }

    return result;
};
