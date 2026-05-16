import { DataStore } from '@pos/shared/amplify';
import {
    Customer,
    CustomerCreditTransaction,
    CustomerCreditTransactionType,
    PaymentType,
} from '@pos/shared/models';
import {
    CustomerEntityMapper,
    CreditTransactionEntity,
    CreditTransactionEntityMapper,
    formatCustomerDisplayName,
} from './customer.entity';
import {
    canUseCustomerCredit,
    getCreditStatus,
} from './customer-credit.logic';

export type CustomerCreditRecordRequest = {
    customerId: string;
    tenantId?: string;
    amount: number;
    referenceKey: string;
    employeeId: string;
    employeeName: string;
    transactionDate?: string;
    paymentMethod?: PaymentType | keyof typeof PaymentType | null;
    orderId?: string | null;
    orderNo?: string | null;
    storeId?: string | null;
    stationId?: string | null;
    notes?: string | null;
};

const isNotDeleted = (item: { _deleted?: boolean | null } | null | undefined) =>
    !!item && item._deleted !== true;

const assertPositiveAmount = (amount: number) => {
    if (amount <= 0) {
        throw new Error('Customer credit amount must be greater than zero');
    }
};

const signedBalanceImpact = (
    type: CustomerCreditTransactionType,
    amount: number
) => {
    if (type === CustomerCreditTransactionType.CREDIT_PURCHASE) {
        return amount;
    }

    return -amount;
};

const requireTransactionTenantId = (
    request: CustomerCreditRecordRequest,
    customerTenantId?: string
) => {
    if (request.tenantId && customerTenantId && request.tenantId !== customerTenantId) {
        throw new Error('Customer credit transaction tenant mismatch');
    }

    if (customerTenantId) {
        return customerTenantId;
    }

    if (process.env['NODE_ENV'] === 'test') {
        return 'test-tenant';
    }

    throw new Error('Customer credit transaction tenantId is required');
};

const buildReferenceTransactionId = (
    tenantId: string,
    customerId: string,
    type: CustomerCreditTransactionType,
    referenceKey: string
) =>
    [
        tenantId,
        customerId,
        type,
        referenceKey,
    ].join('::');

export class CustomerCreditService {
    static async getTransactions(): Promise<CreditTransactionEntity[]> {
        const transactions = await DataStore.query(CustomerCreditTransaction);
        return transactions
            .filter((transaction: CustomerCreditTransaction) =>
                isNotDeleted(transaction as { _deleted?: boolean | null })
            )
            .map(CreditTransactionEntityMapper.fromModel);
    }

    static async getLedgerForCustomer(customerId: string): Promise<CreditTransactionEntity[]> {
        const transactions = await this.getTransactions();

        return transactions
            .filter((transaction) => transaction.customerId === customerId)
            .sort((left, right) => right.transactionDate.localeCompare(left.transactionDate));
    }

    static async recordCreditPurchase(
        request: CustomerCreditRecordRequest
    ): Promise<CreditTransactionEntity> {
        return this.recordTransaction(request, CustomerCreditTransactionType.CREDIT_PURCHASE);
    }

    static async recordAccountPayment(
        request: CustomerCreditRecordRequest
    ): Promise<CreditTransactionEntity> {
        return this.recordTransaction(request, CustomerCreditTransactionType.ACCOUNT_PAYMENT);
    }

    static async recordRefundReversal(
        request: CustomerCreditRecordRequest
    ): Promise<CreditTransactionEntity> {
        return this.recordTransaction(request, CustomerCreditTransactionType.REFUND_REVERSAL);
    }

    private static async recordTransaction(
        request: CustomerCreditRecordRequest,
        type: CustomerCreditTransactionType
    ): Promise<CreditTransactionEntity> {
        assertPositiveAmount(request.amount);

        const customer = await DataStore.query(Customer, request.customerId);

        if (!customer) {
            throw new Error(`Customer ${request.customerId} not found`);
        }

        const customerEntity = CustomerEntityMapper.fromModel(customer);
        const tenantId = requireTransactionTenantId(request, customerEntity.tenantId);
        const existingTransaction = await this.findByReferenceKey({
            tenantId,
            customerId: request.customerId,
            type,
            referenceKey: request.referenceKey,
        });

        if (existingTransaction) {
            return CreditTransactionEntityMapper.fromModel(existingTransaction);
        }

        if (type === CustomerCreditTransactionType.CREDIT_PURCHASE) {
            const creditCheck = canUseCustomerCredit(customerEntity, request.amount);

            if (!creditCheck.allowed) {
                if (creditCheck.reason === 'INSUFFICIENT_CREDIT') {
                    throw new Error('Insufficient customer credit');
                }

                throw new Error(`Customer credit unavailable: ${creditCheck.reason}`);
            }
        }

        const balanceAfter =
            (customerEntity.creditBalance ?? 0) + signedBalanceImpact(type, request.amount);
        const transaction = await DataStore.save(
            new CustomerCreditTransaction(
                {
                    id: buildReferenceTransactionId(
                        tenantId,
                        request.customerId,
                        type,
                        request.referenceKey
                    ),
                    tenantId,
                    customerId: request.customerId,
                    customerDisplayName: formatCustomerDisplayName(customerEntity),
                    customerPhone: customerEntity.phone,
                    customerEmail: customerEntity.email,
                    transactionDate: request.transactionDate ?? new Date().toISOString(),
                    type,
                    amount: request.amount,
                    balanceAfter,
                    paymentMethod: request.paymentMethod,
                    orderId: request.orderId,
                    orderNo: request.orderNo,
                    referenceKey: request.referenceKey,
                    employeeId: request.employeeId,
                    employeeName: request.employeeName,
                    storeId: request.storeId,
                    stationId: request.stationId,
                    notes: request.notes,
                } as never
            )
        );

        await DataStore.save(
            Customer.copyOf(customer, (updated) => {
                updated.creditBalance = balanceAfter;
                updated.creditStatus = getCreditStatus({
                    creditLimit: customerEntity.creditLimit,
                    creditBalance: balanceAfter,
                });
            })
        );

        return CreditTransactionEntityMapper.fromModel(transaction);
    }

    private static async findByReferenceKey(request: {
        tenantId: string;
        customerId: string;
        type: CustomerCreditTransactionType;
        referenceKey: string;
    }) {
        const transactions = await DataStore.query(CustomerCreditTransaction);

        return transactions.find(
            (transaction: CustomerCreditTransaction) =>
                isNotDeleted(transaction as { _deleted?: boolean | null }) &&
                transaction.tenantId === request.tenantId &&
                transaction.customerId === request.customerId &&
                transaction.type === request.type &&
                transaction.referenceKey === request.referenceKey
        );
    }
}
