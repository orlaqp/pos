import React from 'react';

import CategoryList from '../category-list/category-list';
import CategoryForm from '../category-form/category-form';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackNavigation } from '@pos/shared/ui-native';

const Stack = createNativeStackNavigator();

export function Categories() {
  return (
    <StackNavigation Stack={Stack}>
        <Stack.Screen name="Category List"  component={CategoryList} />
        <Stack.Screen name="Category Form" component={CategoryForm} />
    </StackNavigation>
  );
}

export default Categories;
