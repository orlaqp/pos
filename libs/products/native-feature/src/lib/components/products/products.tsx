import React, { useEffect } from 'react';

import ProductList from '../product-list/product-list';
import ProductForm from '../product-form/product-form';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackNavigation } from '@pos/shared/ui-native';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCategories,
    selectLoadingStatus as categorySelectLoadingStatus,
} from '@pos/categories/data-access';
import {
    fetchBrands,
    selectLoadingStatus as brandSelectLoadingStatus,
} from '@pos/brands/data-access';
import {
    fetchUnitOfMeasures,
    selectLoadingStatus as umSelectLadingStatus,
} from '@pos/unit-of-measures/data-access';
import { RouteProp } from '@react-navigation/native';

const Stack = createNativeStackNavigator();
export const shouldFetchLookup = (status: string) => status === 'new';
export const bootstrapProductsLookups = (
    dispatch: (action: any) => void,
    status: string,
    fetchAction: () => any
) => {
    if (shouldFetchLookup(status)) {
        dispatch(fetchAction());
    }
};

export interface ProductsRouteParams {
    initialRouteName?: 'Product List' | 'Product Form';
}

export interface ProductsProps {
    route?: RouteProp<Record<string, ProductsRouteParams | undefined>, string>;
}

export function Products({ route }: ProductsProps) {
    const dispatch = useDispatch();
    const catLoadingStatus = useSelector(categorySelectLoadingStatus);
    const brLoadingStatus = useSelector(brandSelectLoadingStatus);
    const umLoadingStatus = useSelector(umSelectLadingStatus);
    const initialRouteName = route?.params?.initialRouteName || 'Product List';

    useEffect(() => {
        bootstrapProductsLookups(dispatch, catLoadingStatus, fetchCategories);
    }, [catLoadingStatus, dispatch]);

    useEffect(() => {
        bootstrapProductsLookups(dispatch, brLoadingStatus, fetchBrands);
    }, [brLoadingStatus, dispatch]);

    useEffect(() => {
        bootstrapProductsLookups(dispatch, umLoadingStatus, fetchUnitOfMeasures);
    }, [umLoadingStatus, dispatch]);

    return (
        <StackNavigation Stack={Stack} initialRouteName={initialRouteName}>
            <Stack.Screen name="Product List" component={ProductList} />
            <Stack.Screen name="Product Form" component={ProductForm} />
        </StackNavigation>
    );
}

export default Products;
