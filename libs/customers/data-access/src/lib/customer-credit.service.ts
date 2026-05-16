import { DataStore } from '@pos/shared/amplify';
import { CustomerCreditTransaction } from '@pos/shared/models';
import {
    CreditTransactionEntity,
    CreditTransactionEntityMapper,
} from './customer.entity';

export class CustomerCreditService {
    static async getTransactions(): Promise<CreditTransactionEntity[]> {
        const transactions = await DataStore.query(CustomerCreditTransaction);
        return transactions.map(CreditTransactionEntityMapper.fromModel);
    }
}
