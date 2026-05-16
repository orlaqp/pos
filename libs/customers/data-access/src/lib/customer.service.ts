import { DataStore } from '@pos/shared/amplify';
import { Customer } from '@pos/shared/models';
import { CustomerEntity, CustomerEntityMapper } from './customer.entity';

export class CustomerService {
    static async getAll(): Promise<CustomerEntity[]> {
        const customers = await DataStore.query(Customer);
        return customers.map(CustomerEntityMapper.fromModel);
    }
}
