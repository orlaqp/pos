import { CustomerEntity, CreditTransactionEntity } from './customer.entity';

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
