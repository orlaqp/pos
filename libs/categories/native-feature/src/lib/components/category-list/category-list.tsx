import React from 'react';
import { categoriesActions, fetchCategories, selectFilteredList, selectIsEmpty, selectLoadingStatus } from '@pos/categories/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CategoryItem from '../category-item/category-item';

export interface CategoryListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function CategoryList({ navigation }: CategoryListProps) {
    const props: ItemListProps<any, any> = {
        ItemComponent: CategoryItem,
        formNavName: 'Category Form',
        navigation: navigation,
        isEmptySelector: selectIsEmpty,
        loadingStatusSelector: selectLoadingStatus,
        filteredListSelector: selectFilteredList,
        clearSelectionAction: categoriesActions.clearSelection,
        filterAction: categoriesActions.filter,
        fetchItemsAction: fetchCategories,
    }

    return <UIGenericItemList {...props} />
};

export default CategoryList;
