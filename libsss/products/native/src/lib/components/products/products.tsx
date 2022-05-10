
import React from 'react';

import ProductList from '../product-list/product-list';
import ProductForm from '../product-form/product-form';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackNavigation } from '@pos/shared/ui-native';

const Stack = createNativeStackNavigator();

export function Products() {
  return (
    <StackNavigation Stack={Stack}>
        <Stack.Screen name="Product List"  component={ProductList} />
        <Stack.Screen name="Product Form" component={ProductForm} />
    </StackNavigation>
  );
}

export default Products;
