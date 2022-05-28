import React, { useEffect } from 'react';
import {
    categoriesActions,
    selectFilteredList,
    selectIsEmpty,
    selectLoadingStatus,
    subscribeToCategoryChanges,
} from '@pos/categories/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CategoryItem from '../category-item/category-item';
import { useDispatch } from 'react-redux';

export interface CategoryListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function CategoryList({ navigation }: CategoryListProps) {
    const dispatch = useDispatch();

    useEffect(() => {
        const sub = subscribeToCategoryChanges(dispatch);
        return () => {
            console.log('Closing category subscription');
            sub.unsubscribe()
        }
    }, [dispatch]);

    const props: ItemListProps<any, any> = {
        ItemComponent: CategoryItem,
        formNavName: 'Category Form',
        navigation: navigation,
        isEmptySelector: selectIsEmpty,
        loadingStatusSelector: selectLoadingStatus,
        filteredListSelector: selectFilteredList,
        clearSelectionAction: categoriesActions.clearSelection,
        filterAction: categoriesActions.filter,
        fetchItemsAction: undefined,
    };

    return <UIGenericItemList {...props} />;
}

export default CategoryList;
