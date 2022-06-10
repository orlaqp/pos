
import React from 'react';

import EmployeeList from '../employee-list/employee-list';
import EmployeeForm from '../employee-form/employee-form';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackNavigation } from '@pos/shared/ui-native';

const Stack = createNativeStackNavigator();

export function Employees() {
  return (
    <StackNavigation Stack={Stack}>
        <Stack.Screen name="Employee List"  component={EmployeeList} />
        <Stack.Screen name="Employee Form" component={EmployeeForm} />
    </StackNavigation>
  );
}

export default Employees;
