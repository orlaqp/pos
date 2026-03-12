import React, { useEffect } from 'react';
import {
    inventoryCountActions,
    fetchInventoryCount,
    selectInventoryCountFilteredList,
    selectInventoryCountIsEmpty,
    selectInventoryCountLoadingStatus,
    subscribeToInventoryCountChanges,
    subscribeToInventoryCountLineChanges,
} from '@pos/inventory/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import InventoryCountItem from './inventory-count-item';
import { useDispatch } from 'react-redux';

type InventoryNavigationParams = Record<string, object | undefined>;

export interface InventoryListProps {
    navigation: NativeStackNavigationProp<InventoryNavigationParams>;
}

export function InventoryCountList({ navigation }: InventoryListProps) {
    const dispatch = useDispatch();

    useEffect(() => {
        const counts = subscribeToInventoryCountChanges(dispatch);
        const lines = subscribeToInventoryCountLineChanges(dispatch);
        
        return () => {
            console.log('Closing inventory count subscription');
            counts.unsubscribe();
            lines.unsubscribe();
        };
    }, [dispatch]);

    const props: ItemListProps<unknown, unknown> = {
        ItemComponent: InventoryCountItem,
        formNavName: 'Inventory Count Form',
        navigation: navigation,
        isEmptySelector: selectInventoryCountIsEmpty,
        loadingStatusSelector: selectInventoryCountLoadingStatus,
        filteredListSelector: selectInventoryCountFilteredList,
        clearSelectionAction: inventoryCountActions.clearSelection,
        filterAction: inventoryCountActions.filter,
        fetchItemsAction: fetchInventoryCount,
    };

    return <UIGenericItemList {...props} />;
}

export default InventoryCountList;
