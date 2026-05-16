import React from 'react';

import ProductList from '../product-list/product-list';
import ProductForm from '../product-form/product-form';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackNavigation } from '@pos/shared/ui-native';
import { RouteProp } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

export interface ProductsRouteParams {
    initialRouteName?: 'Product List' | 'Product Form';
}

export interface ProductsProps {
    route?: RouteProp<Record<string, ProductsRouteParams | undefined>, string>;
}

export function Products({ route }: ProductsProps) {
    const initialRouteName = route?.params?.initialRouteName || 'Product List';

    return (
        <StackNavigation Stack={Stack} initialRouteName={initialRouteName}>
            <Stack.Screen
                name="Product List"
                component={ProductList}
                options={{ headerShown: false }}
            />
            <Stack.Screen name="Product Form" component={ProductForm} />
        </StackNavigation>
    );
}

export default Products;
