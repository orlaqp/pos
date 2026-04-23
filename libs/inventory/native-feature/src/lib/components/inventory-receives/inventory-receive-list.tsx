import React from 'react';
import {
    inventoryReceiveActions,
    fetchInventoryReceive,
    selectInventoryReceiveFilteredList,
    selectInventoryReceiveIsEmpty,
    selectInventoryReceiveLoadingStatus,
    subscribeToInventoryReceiveChanges,
    subscribeToInventoryReceiveLineChanges,
} from '@pos/inventory/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { enableInventorySync } from '@pos/shared/data-store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import InventoryReceiveItem from './inventory-receive-item';
import { ActivityIndicator, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { Text } from '@rneui/themed';

type InventoryNavigationParams = Record<string, object | undefined>;

export interface InventoryListProps {
    navigation: NativeStackNavigationProp<InventoryNavigationParams>;
}

export function InventoryReceiveList({ navigation }: InventoryListProps) {
    const dispatch = useDispatch();
    const tokens = useDesignTokens();
    const [isPreparingInventorySync, setIsPreparingInventorySync] = React.useState(true);

    React.useEffect(() => {
        let active = true;
        let receives: { unsubscribe: () => void } | undefined;
        let lines: { unsubscribe: () => void } | undefined;

        void (async () => {
            await enableInventorySync();
            if (!active) return;
            receives = subscribeToInventoryReceiveChanges(dispatch);
            lines = subscribeToInventoryReceiveLineChanges(dispatch);
            await dispatch(fetchInventoryReceive());
            if (!active) return;
            setIsPreparingInventorySync(false);
        })();

        return () => {
            active = false;
            receives?.unsubscribe();
            lines?.unsubscribe();
        };
    }, [dispatch]);

    if (isPreparingInventorySync) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: tokens.spacing.lg,
                    backgroundColor: tokens.colors.canvas,
                }}
            >
                <ActivityIndicator size="large" color={tokens.colors.primary} />
                <Text style={{ marginTop: tokens.spacing.md, color: tokens.colors.text }}>
                    Loading inventory records...
                </Text>
            </View>
        );
    }

    const props: ItemListProps<unknown, unknown> = {
        ItemComponent: InventoryReceiveItem,
        formNavName: 'Inventory Receive Form',
        navigation: navigation,
        isEmptySelector: selectInventoryReceiveIsEmpty,
        loadingStatusSelector: selectInventoryReceiveLoadingStatus,
        filteredListSelector: selectInventoryReceiveFilteredList,
        clearSelectionAction: inventoryReceiveActions.clearSelection,
        filterAction: inventoryReceiveActions.filter,
        fetchItemsAction: fetchInventoryReceive,
        plainHeader: true,
    };

    return <UIGenericItemList {...props} />;
}

export default InventoryReceiveList;
