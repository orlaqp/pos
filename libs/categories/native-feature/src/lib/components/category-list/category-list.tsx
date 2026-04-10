import React from 'react';
import {
    categoriesActions,
    selectFilteredList,
    selectIsEmpty,
    selectLoadingStatus,
    subscribeToCategoryChanges,
} from '@pos/categories/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CategoryItem from '../category-item/category-item';
import { useDispatch } from 'react-redux';

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
    } as ItemListProps<any, any>);

export function CategoryList({ navigation }: CategoryListProps) {
    const dispatch = useDispatch();

    useFocusEffect(
        React.useCallback(() => {
            const sub = subscribeToCategoryChanges(dispatch);
            return () => {
                sub.unsubscribe();
            };
        }, [dispatch])
    );

    const props = buildCategoryListProps(navigation);

    return <UIGenericItemList {...props} />;
}

export default CategoryList;
