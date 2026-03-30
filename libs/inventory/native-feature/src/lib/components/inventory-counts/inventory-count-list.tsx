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
import { enableInventorySync } from '@pos/shared/data-store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import InventoryCountItem from './inventory-count-item';
import { ActivityIndicator, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { Text } from '@rneui/themed';

type InventoryNavigationParams = Record<string, object | undefined>;

export interface InventoryListProps {
    navigation: NativeStackNavigationProp<InventoryNavigationParams>;
}

export function InventoryCountList({ navigation }: InventoryListProps) {
    const dispatch = useDispatch();
    const tokens = useDesignTokens();
    const [isPreparingInventorySync, setIsPreparingInventorySync] = React.useState(true);

    useEffect(() => {
        let active = true;
        let counts: { unsubscribe: () => void } | undefined;
        let lines: { unsubscribe: () => void } | undefined;

        void (async () => {
            await enableInventorySync();
            if (!active) return;
            counts = subscribeToInventoryCountChanges(dispatch);
            lines = subscribeToInventoryCountLineChanges(dispatch);
            await dispatch(fetchInventoryCount());
            if (!active) return;
            setIsPreparingInventorySync(false);
        })();

        return () => {
            active = false;
            console.log('Closing inventory count subscription');
            counts?.unsubscribe();
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
