import React, { useEffect } from 'react';
import {
    inventoryReceiveActions,
    fetchInventoryReceive,
    selectInventoryReceiveFilteredList,
    selectInventoryCountIsEmpty,
    selectInventoryCountLoadingStatus,
    subscribeToInventoryReceiveChanges,
    subscribeToInventoryReceiveLineChanges,
} from '@pos/inventory/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import InventoryReceiveItem from './inventory-receive-item';
import { useDispatch } from 'react-redux';

export interface InventoryListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function InventoryReceiveList({ navigation }: InventoryListProps) {
    const dispatch = useDispatch();

    useEffect(() => {
        const receives = subscribeToInventoryReceiveChanges(dispatch);
        const lines = subscribeToInventoryReceiveLineChanges(dispatch);

        return () => {
            console.log('Closing inventory receive subscription');
            receives.unsubscribe();
            lines.unsubscribe();
        };
    }, [dispatch]);

    const props: ItemListProps<any, any> = {
        ItemComponent: InventoryReceiveItem,
        formNavName: 'Inventory Receive Form',
        navigation: navigation,
        isEmptySelector: selectInventoryCountIsEmpty,
        loadingStatusSelector: selectInventoryCountLoadingStatus,
        filteredListSelector: selectInventoryReceiveFilteredList,
        clearSelectionAction: inventoryReceiveActions.clearSelection,
        filterAction: inventoryReceiveActions.filter,
        fetchItemsAction: fetchInventoryReceive,
    };

    return <UIGenericItemList {...props} />;
}

export default InventoryReceiveList;
