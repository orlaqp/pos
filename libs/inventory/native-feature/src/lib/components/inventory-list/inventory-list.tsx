
import React from 'react';
import { inventoriesActions, fetchInventories, selectFilteredList, selectIsEmpty, selectLoadingStatus } from '@pos/inventories/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import InventoryItem from '../inventory-item/inventory-item';

export interface InventoryListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function InventoryList({ navigation }: InventoryListProps) {
    const props: ItemListProps<any, any> = {
        ItemComponent: InventoryItem,
        formNavName: 'Inventory Form',
        navigation: navigation,
        isEmptySelector: selectIsEmpty,
        loadingStatusSelector: selectLoadingStatus,
        filteredListSelector: selectFilteredList,
        clearSelectionAction: inventoriesActions.clearSelection,
        filterAction: inventoriesActions.filter,
        fetchItemsAction: fetchInventories,
    }

    return <UIGenericItemList {...props} />
};

export default InventoryList;
