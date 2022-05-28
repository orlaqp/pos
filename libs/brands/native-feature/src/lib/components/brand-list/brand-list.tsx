
import React, { useEffect } from 'react';
import { brandsActions, selectFilteredList, selectIsEmpty, selectLoadingStatus, subscribeToBrandChanges } from '@pos/brands/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BrandItem from '../brand-item/brand-item';
import { useDispatch } from 'react-redux';

export interface BrandListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function BrandList({ navigation }: BrandListProps) {
    const dispatch = useDispatch();

    useEffect(() => {
        const sub = subscribeToBrandChanges(dispatch);
        return () => {
            console.log('Closing brands subscription');
            sub.unsubscribe()
        }
    }, [dispatch]);
    
    const props: ItemListProps<any, any> = {
        ItemComponent: BrandItem,
        formNavName: 'Brand Form',
        navigation: navigation,
        isEmptySelector: selectIsEmpty,
        loadingStatusSelector: selectLoadingStatus,
        filteredListSelector: selectFilteredList,
        clearSelectionAction: brandsActions.clearSelection,
        filterAction: brandsActions.filter,
        fetchItemsAction: undefined,
    }

    return <UIGenericItemList {...props} />
};

export default BrandList;
