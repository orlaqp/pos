import React, { useEffect } from 'react';
import {
    productsActions,
    fetchProducts,
    selectFilteredList,
    selectIsEmpty,
    selectLoadingStatus,
    syncProducts,
    subscribeToProductChanges,
} from '@pos/products/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ProductItem from '../product-item/product-item';
import { useDispatch } from 'react-redux';

export interface ProductListProps {
    navigation: NativeStackNavigationProp<any>;
}

export const buildProductListProps = (navigation: NativeStackNavigationProp<any>) =>
    ({
        ItemComponent: ProductItem,
        formNavName: 'Product Form',
        navigation: navigation,
        isEmptySelector: selectIsEmpty,
        loadingStatusSelector: selectLoadingStatus,
        filteredListSelector: selectFilteredList,
        clearSelectionAction: productsActions.clearSelection,
        filterAction: productsActions.filter as any,
        fetchItemsAction: fetchProducts,
    } as ItemListProps<any, any>);

export function ProductList({ navigation }: ProductListProps) {
    const dispatch = useDispatch();

    useEffect(() => {
        syncProducts(dispatch);
        const sub = subscribeToProductChanges(dispatch);
        return () => {
            console.log('Closing products subscription');
            sub.unsubscribe();
        };
    }, [dispatch]);

    const props = buildProductListProps(navigation);

    return <UIGenericItemList {...props} />;
}

export default ProductList;
