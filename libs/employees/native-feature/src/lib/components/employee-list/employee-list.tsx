
import React from 'react';
import { employeesActions, fetchEmployees, selectFilteredList, selectIsEmpty, selectLoadingStatus } from '@pos/employees/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import EmployeeItem from '../employee-item/employee-item';

export interface EmployeeListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function EmployeeList({ navigation }: EmployeeListProps) {
    const props: ItemListProps<any, any> = {
        ItemComponent: EmployeeItem,
        formNavName: 'Employee Form',
        navigation: navigation,
        isEmptySelector: selectIsEmpty,
        loadingStatusSelector: selectLoadingStatus,
        filteredListSelector: selectFilteredList,
        clearSelectionAction: employeesActions.clearSelection,
        filterAction: employeesActions.filter,
        fetchItemsAction: fetchEmployees,
    }

    return <UIGenericItemList {...props} />
};

export default EmployeeList;
