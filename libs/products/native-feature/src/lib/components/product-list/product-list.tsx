
import React from 'react';
import { productsActions, fetchProducts, selectFilteredList, selectIsEmpty, selectLoadingStatus } from '@pos/products/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ProductItem from '../product-item/product-item';

export interface ProductListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function ProductList({ navigation }: ProductListProps) {
    const props: ItemListProps<any, any> = {
        ItemComponent: ProductItem,
        formNavName: 'Product Form',
        navigation: navigation,
        isEmptySelector: selectIsEmpty,
        loadingStatusSelector: selectLoadingStatus,
        filteredListSelector: selectFilteredList,
        clearSelectionAction: productsActions.clearSelection,
        filterAction: productsActions.filter,
        fetchItemsAction: undefined,
    }

    return <UIGenericItemList {...props} />
};

export default ProductList;
