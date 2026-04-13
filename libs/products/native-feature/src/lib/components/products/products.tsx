import React from 'react';

import ProductList from '../product-list/product-list';
import ProductForm from '../product-form/product-form';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackNavigation } from '@pos/shared/ui-native';
import { useDispatch } from 'react-redux';
import { subscribeToCategoryChanges } from '@pos/categories/data-access';
import { subscribeToBrandChanges } from '@pos/brands/data-access';
import { subscribeToUnitOfMeasureChanges } from '@pos/unit-of-measures/data-access';
import { RouteProp, useFocusEffect } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

export interface ProductsRouteParams {
    initialRouteName?: 'Product List' | 'Product Form';
}

export interface ProductsProps {
    route?: RouteProp<Record<string, ProductsRouteParams | undefined>, string>;
}

export function Products({ route }: ProductsProps) {
    const dispatch = useDispatch();
    const initialRouteName = route?.params?.initialRouteName || 'Product List';

    useFocusEffect(
        React.useCallback(() => {
            const categoriesSubscription = subscribeToCategoryChanges(dispatch);
            const brandsSubscription = subscribeToBrandChanges(dispatch);
            const unitOfMeasuresSubscription =
                subscribeToUnitOfMeasureChanges(dispatch);

            return () => {
                categoriesSubscription.unsubscribe();
                brandsSubscription.unsubscribe();
                unitOfMeasuresSubscription.unsubscribe();
            };
        }, [dispatch])
    );

    return (
        <StackNavigation Stack={Stack} initialRouteName={initialRouteName}>
            <Stack.Screen name="Product List" component={ProductList} />
            <Stack.Screen name="Product Form" component={ProductForm} />
        </StackNavigation>
    );
}

export default Products;
