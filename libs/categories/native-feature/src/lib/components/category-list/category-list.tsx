import React from 'react';
import {
    categoriesActions,
    selectFilteredList,
    selectIsEmpty,
    selectLoadingStatus,
} from '@pos/categories/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CategoryItem from '../category-item/category-item';

export interface CategoryListProps {
    navigation: NativeStackNavigationProp<any>;
}

export const buildCategoryListProps = (navigation: NativeStackNavigationProp<any>) =>
    ({
        ItemComponent: CategoryItem,
        formNavName: 'Category Form',
        navigation: navigation,
        isEmptySelector: selectIsEmpty,
        loadingStatusSelector: selectLoadingStatus,
        filteredListSelector: selectFilteredList,
        clearSelectionAction: categoriesActions.clearSelection,
        filterAction: categoriesActions.filter,
        fetchItemsAction: undefined,
        emptyTitle: 'No categories yet',
        emptySubtitle:
            'Create categories to organize products and make catalog browsing easier.',
        emptyActionText: 'Add category',
        emptyActionIcon: 'shape-outline',
        headerEyebrow: 'Catalog',
        headerTitle: 'Categories',
        headerSubtitle:
            'Group products into clear browsing sections for sales and reporting.',
    } as ItemListProps<any, any>);

export function CategoryList({ navigation }: CategoryListProps) {
    const props = buildCategoryListProps(navigation);

    return <UIGenericItemList {...props} />;
}

export default CategoryList;
