
import React from 'react';
import { inventoryReceiveActions, fetchInventoryReceive, selectInvReceiveFilteredList, selectInventoryCountIsEmpty, selectInventoryCountLoadingStatus } from '@pos/inventory/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import InventoryReceiveItem from './inventory-receive-item';

export interface InventoryListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function InventoryReceiveList({ navigation }: InventoryListProps) {
    const props: ItemListProps<any, any> = {
        ItemComponent: InventoryReceiveItem,
        formNavName: 'Inventory Receive Form',
        navigation: navigation,
        isEmptySelector: selectInventoryCountIsEmpty,
        loadingStatusSelector: selectInventoryCountLoadingStatus,
        filteredListSelector: selectInvReceiveFilteredList,
        clearSelectionAction: inventoryReceiveActions.clearSelection,
        filterAction: inventoryReceiveActions.filter,
        fetchItemsAction: fetchInventoryReceive,
    }

    return <UIGenericItemList {...props} />
};

export default InventoryReceiveList;
