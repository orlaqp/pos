import {
    Customer,
    CustomerCreditStatus,
    CustomerCreditTransaction,
    CustomerCreditTransactionType,
    PaymentType,
} from '@pos/shared/models';

export type CustomerEntity = {
    id?: string;
    tenantId?: string;
    displayName?: string;
    firstName: string;
    lastName?: string | null | undefined;
    middleName?: string | null | undefined;
    dob?: string | null | undefined;
    phone?: string | null | undefined;
    email?: string | null | undefined;
    active?: boolean | null | undefined;
    creditLimit?: number | null | undefined;
    creditBalance?: number | null | undefined;
    creditStatus?: CustomerCreditStatus | keyof typeof CustomerCreditStatus | null | undefined;
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
};

export type CreditTransactionEntity = {
    id?: string;
    tenantId?: string;
    customerId: string;
    customerDisplayName: string;
    customerPhone?: string | null | undefined;
    customerEmail?: string | null | undefined;
    transactionDate: string;
    type: CustomerCreditTransactionType | keyof typeof CustomerCreditTransactionType;
    amount: number;
    balanceAfter: number;
    paymentMethod?: PaymentType | keyof typeof PaymentType | null | undefined;
    orderId?: string | null | undefined;
    orderNo?: string | null | undefined;
    referenceKey: string;
    employeeId: string;
    employeeName: string;
    storeId?: string | null | undefined;
    stationId?: string | null | undefined;
    notes?: string | null | undefined;
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
};

const coalesceCreditAmount = (value?: number | null) => value ?? 0;

const coalesceCreditStatus = (
    customer: Pick<CustomerEntity, 'creditLimit' | 'creditBalance' | 'creditStatus'>
) => {
    if (customer.creditStatus) {
        return customer.creditStatus;
    }

    return coalesceCreditAmount(customer.creditBalance) > coalesceCreditAmount(customer.creditLimit)
        ? CustomerCreditStatus.OVER_LIMIT
        : CustomerCreditStatus.OK;
};

export const formatCustomerDisplayName = (
    customer: Pick<CustomerEntity, 'firstName' | 'middleName' | 'lastName'>
) =>
    [customer.firstName, customer.middleName, customer.lastName]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(' ');

export class CustomerEntityMapper {
    static fromModel(customer: Customer): CustomerEntity {
        return {
            id: customer.id,
            tenantId: customer.tenantId,
            displayName: formatCustomerDisplayName(customer),
            firstName: customer.firstName,
            lastName: customer.lastName,
            middleName: customer.middleName,
            dob: customer.dob,
            phone: customer.phone,
            email: customer.email,
            active: customer.active ?? true,
            creditLimit: coalesceCreditAmount(customer.creditLimit),
            creditBalance: coalesceCreditAmount(customer.creditBalance),
            creditStatus: coalesceCreditStatus(customer),
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt,
        };
    }
}

export class CreditTransactionEntityMapper {
    static fromModel(transaction: CustomerCreditTransaction): CreditTransactionEntity {
        return {
            id: transaction.id,
            tenantId: transaction.tenantId,
            customerId: transaction.customerId,
            customerDisplayName: transaction.customerDisplayName,
            customerPhone: transaction.customerPhone,
            customerEmail: transaction.customerEmail,
            transactionDate: transaction.transactionDate,
            type: transaction.type,
            amount: transaction.amount,
            balanceAfter: transaction.balanceAfter,
            paymentMethod: transaction.paymentMethod,
            orderId: transaction.orderId,
            orderNo: transaction.orderNo,
            referenceKey: transaction.referenceKey,
            employeeId: transaction.employeeId,
            employeeName: transaction.employeeName,
            storeId: transaction.storeId,
            stationId: transaction.stationId,
            notes: transaction.notes,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
        };
    }
}
