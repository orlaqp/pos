
import React from 'react';
import { inventoryCountActions, fetchInventoryCount, selectInventoryCountFilteredList, selectInventoryCountIsEmpty, selectInventoryCountLoadingStatus } from '@pos/inventory/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import InventoryCountItem from './inventory-count-item';

export interface InventoryListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function InventoryCountList({ navigation }: InventoryListProps) {
    const props: ItemListProps<any, any> = {
        ItemComponent: InventoryCountItem,
        formNavName: 'Inventory Count Form',
        navigation: navigation,
        isEmptySelector: selectInventoryCountIsEmpty,
        loadingStatusSelector: selectInventoryCountLoadingStatus,
        filteredListSelector: selectInventoryCountFilteredList,
        clearSelectionAction: inventoryCountActions.clearSelection,
        filterAction: inventoryCountActions.filter,
        fetchItemsAction: fetchInventoryCount,
    }

    return <UIGenericItemList {...props} />
};

export default InventoryCountList;
