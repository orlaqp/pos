import React from 'react';
import { brandsActions, selectFilteredList, selectIsEmpty, selectLoadingStatus, subscribeToBrandChanges } from '@pos/brands/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BrandItem from '../brand-item/brand-item';
import { useDispatch } from 'react-redux';

export interface BrandListProps {
    navigation: NativeStackNavigationProp<any>;
}

export const buildBrandListProps = (navigation: NativeStackNavigationProp<any>) =>
    ({
        ItemComponent: BrandItem,
        formNavName: 'Brand Form',
        navigation: navigation,
        isEmptySelector: selectIsEmpty,
        loadingStatusSelector: selectLoadingStatus,
        filteredListSelector: selectFilteredList,
        clearSelectionAction: brandsActions.clearSelection,
        filterAction: brandsActions.filter,
        fetchItemsAction: undefined,
        emptyTitle: 'No brands yet',
        emptySubtitle:
            'Create brands to group products and keep the catalog consistent.',
        emptyActionText: 'Add brand',
        emptyActionIcon: 'tag-outline',
    } as ItemListProps<any, any>);

export function BrandList({ navigation }: BrandListProps) {
    const dispatch = useDispatch();

    useFocusEffect(
        React.useCallback(() => {
            const sub = subscribeToBrandChanges(dispatch);
            return () => {
                sub.unsubscribe();
            };
        }, [dispatch])
    );
    
    const props = buildBrandListProps(navigation);

    return <UIGenericItemList {...props} />
};

export default BrandList;
