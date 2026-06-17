import React from 'react';
import { ScrollView } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentTenantId } from '@pos/auth/data-access';
import {
    CreditTransactionEntity,
    customersActions,
    selectSelectedCustomer,
} from '@pos/customers/data-access';
import { selectLoginEmployee } from '@pos/employees/data-access';
import { CustomerCreditStatus } from '@pos/shared/models';
import { StackNavigation } from '@pos/shared/ui-native';
import CustomerList from '../customer-list/customer-list';
import CustomerForm from '../customer-form/customer-form';
import CustomerAccountPaymentDialog from '../customer-credit/customer-account-payment-dialog';

const Stack = createNativeStackNavigator();

function CustomerPaymentScreen({ navigation }: { navigation: { goBack: () => void } }) {
    const dispatch = useDispatch();
    const customer = useSelector(selectSelectedCustomer);
    const employee = useSelector(selectLoginEmployee);
    const tenantId = useSelector(selectCurrentTenantId);
    const updateCustomerAccount = (transaction: CreditTransactionEntity) => {
        if (!customer) {
            navigation.goBack();
            return;
        }

        const updatedCustomer = {
            ...customer,
            creditBalance: transaction.balanceAfter,
            creditStatus:
                transaction.balanceAfter > (customer.creditLimit ?? 0)
                    ? CustomerCreditStatus.OVER_LIMIT
                    : CustomerCreditStatus.OK,
        };

        dispatch(customersActions.upsert(updatedCustomer));
        dispatch(customersActions.select(updatedCustomer));
        dispatch(customersActions.addLedgerTransaction(transaction));
        navigation.goBack();
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: '#080B10' }}>
            <CustomerAccountPaymentDialog
                customer={customer}
                currentEmployee={employee}
                tenantId={tenantId}
                onCancel={() => navigation.goBack()}
                onSaved={updateCustomerAccount}
            />
        </ScrollView>
    );
}

export function Customers() {
    return (
        <StackNavigation Stack={Stack}>
            <Stack.Screen
                name="Customer List"
                component={CustomerList}
                options={{ headerShown: false }}
            />
            <Stack.Screen name="Customer Form" component={CustomerForm} />
            <Stack.Screen name="Customer Payment" component={CustomerPaymentScreen} />
        </StackNavigation>
    );
}

Customers.Screen = Stack.Screen;

export default Customers;
