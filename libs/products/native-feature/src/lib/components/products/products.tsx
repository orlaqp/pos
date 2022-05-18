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

const Stack = createNativeStackNavigator();

export function Products() {
    const dispatch = useDispatch();
    const catLoadingStatus = useSelector(categorySelectLoadingStatus);
    const brLoadingStatus = useSelector(brandSelectLoadingStatus);
    const umLoadingStatus = useSelector(umSelectLadingStatus);

    useEffect(() => {
        if (catLoadingStatus === 'new') dispatch(fetchCategories());
    }, [catLoadingStatus, dispatch]);

    useEffect(() => {
        if (brLoadingStatus === 'new') dispatch(fetchBrands());
    }, [brLoadingStatus, dispatch]);

    useEffect(() => {
        if (umLoadingStatus === 'new') dispatch(fetchUnitOfMeasures());
    }, [umLoadingStatus, dispatch]);

    return (
        <StackNavigation Stack={Stack}>
            <Stack.Screen name="Product List" component={ProductList} />
            <Stack.Screen name="Product Form" component={ProductForm} />
        </StackNavigation>
    );
}

export default Products;
