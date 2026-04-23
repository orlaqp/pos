import React from 'react';
import {
    productsActions,
    fetchProducts,
    selectFilteredList,
    selectIsEmpty,
    selectLoadingStatus,
} from '@pos/products/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ProductItem from '../product-item/product-item';

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
        emptyTitle: 'No products yet',
        emptySubtitle:
            'Add your first product to start building the catalog available to sales.',
        emptyActionText: 'Add product',
        emptyActionIcon: 'plus-box-outline',
        headerEyebrow: 'Catalog',
        headerTitle: 'Products',
        headerSubtitle:
            'Manage sale-ready items, pricing, inventory behavior, and catalog visibility.',
    } as ItemListProps<any, any>);

export function ProductList({ navigation }: ProductListProps) {
    const props = buildProductListProps(navigation);

    return <UIGenericItemList {...props} />;
}

export default ProductList;
