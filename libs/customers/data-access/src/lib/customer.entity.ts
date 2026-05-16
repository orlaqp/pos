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

export class CustomerEntityMapper {
    static fromModel(customer: Customer): CustomerEntity {
        return {
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
