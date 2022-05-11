
import React from 'react';
import { brandsActions, fetchBrands, selectFilteredList, selectIsEmpty, selectLoadingStatus } from '@pos/brands/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BrandItem from '../brand-item/brand-item';

export interface BrandListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function BrandList({ navigation }: BrandListProps) {
    const props: ItemListProps<any, any> = {
        ItemComponent: BrandItem,
        formNavName: 'Brand Form',
        navigation: navigation,
        isEmptySelector: selectIsEmpty,
        loadingStatusSelector: selectLoadingStatus,
        filteredListSelector: selectFilteredList,
        clearSelectionAction: brandsActions.clearSelection,
        filterAction: brandsActions.filter,
        fetchItemsAction: fetchBrands,
    }

    return <UIGenericItemList {...props} />
};

export default BrandList;
