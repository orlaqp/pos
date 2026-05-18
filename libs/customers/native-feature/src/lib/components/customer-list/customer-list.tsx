import React from 'react';
import {
    CustomerEntity,
    customersActions,
    fetchCustomers,
    selectFilteredList,
    selectIsEmpty,
    selectLoadingStatus,
} from '@pos/customers/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootState } from '@pos/store';
import CustomerItem from '../customer-item/customer-item';

type CustomerStackParamList = {
    'Customer Form': undefined;
    'Customer Payment': undefined;
};

export interface CustomerListProps {
    navigation: NativeStackNavigationProp<CustomerStackParamList>;
}

export function CustomerList({ navigation }: CustomerListProps) {
    const props: ItemListProps<RootState, CustomerEntity> = {
        ItemComponent: CustomerItem,
        formNavName: 'Customer Form',
        navigation,
        isEmptySelector: selectIsEmpty,
        loadingStatusSelector: selectLoadingStatus,
        filteredListSelector: selectFilteredList,
        clearSelectionAction: customersActions.clearSelection,
        filterAction: customersActions.filter,
        fetchItemsAction: fetchCustomers,
        headerEyebrow: 'Management',
        headerTitle: 'Customers',
        headerSubtitle:
            'Manage customer profiles, account status, and credit balances.',
        emptyTitle: 'No customers yet',
        emptySubtitle:
            'Create the first customer account to support credit purchases.',
        emptyActionText: 'Add customer',
        emptyActionIcon: 'account-plus-outline',
    };

    return <UIGenericItemList {...props} />;
}

export default CustomerList;
