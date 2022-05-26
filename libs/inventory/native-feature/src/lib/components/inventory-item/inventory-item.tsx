
import React, { useState } from 'react';

import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import { inventoryCountActions, InventoryCountDTO, InventoryCountLineDTO, InventoryCountService } from '@pos/inventory/data-access';
import { useDispatch } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface InventoryItemProps {
    item: InventoryCountLineDTO;
    navigation: NativeStackNavigationProp<any>;
}

export function InventoryItem({ item, navigation }: InventoryItemProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const dispatch = useDispatch();
    const [busy, setBusy] = useState<boolean>(false);

    const deleteItem = async () => {
        if (!item.id) return;

        setBusy(true);
        await InventoryCountService.delete(item.id);
        setBusy(false);
        dispatch(inventoryCountActions.remove(item.id));
    }

    const editItem = () => {
        dispatch(inventoryCountActions.select(item));
        navigation.navigate('Inventory Form');
    }

    const confirmDeletion = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [
                { text: 'No' },
                { text: 'Yes', onPress: () => deleteItem() },
            ]
        );
    }

    return (
        <View style={[styles.dataRow]}>
            { busy &&
            <ActivityIndicator size='small' />
            }
            <View style={{ flex: 2 }}>
                <Text style={styles.name}>{item.productName}</Text>
            </View>
            <View
                style={{
                    flex: 2,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }}
            >
                <Button
                    type="clear"
                    title="Edit"
                    icon={{
                        name: 'pencil-outline',
                        type: 'material-community',
                    }}
                    onPress={editItem}
                />
                <Button
                    type="clear"
                    icon={{
                        name: 'trash-can',
                        type: 'material-community',
                        color: theme.theme.colors.error,
                    }}
                    onPress={confirmDeletion}
                />
            </View>
        </View>
    );
}

export default InventoryItem;
