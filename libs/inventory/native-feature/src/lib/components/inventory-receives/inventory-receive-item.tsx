import React, { useState } from 'react';

import { View, Text, Alert } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import {
    inventoryReceiveActions,
    InventoryReceiveDTO,
    InventoryReceiveService,
} from '@pos/inventory/data-access';
import { useDispatch } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
export interface InventoryItemProps {
    item: InventoryReceiveDTO;
    navigation: NativeStackNavigationProp<any>;
}

export function InventoryReceiveItem({ item, navigation }: InventoryItemProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const dispatch = useDispatch();
    const [busy, setBusy] = useState<boolean>(false);

    const editItem = () => {
        dispatch(inventoryReceiveActions.select(item));
        navigation.navigate('Inventory Receive Form');
    };

    const showItem = () => {
        dispatch(inventoryReceiveActions.select(item));
        navigation.navigate('Inventory Receive Form', { readOnly: true });
    };

    const deleteItem = async () => {
        if (!item.id) return;

        setBusy(true);
        await InventoryReceiveService.delete(item.id);
        setBusy(false);
        dispatch(inventoryReceiveActions.remove(item.id));
    };

    const confirmDeletion = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [{ text: 'No' }, { text: 'Yes', onPress: () => deleteItem() }]
        );
    };

    return (
        <View style={[styles.dataRow, styles.centered]}>
            <View style={{ flex: 4, flexDirection: 'row' }}>
                <Text style={styles.name}>{item.createdAt}</Text>
            </View>
            <View style={{ flex: 2, flexDirection: 'row' }}>
                <Text style={styles.name}>{item.status}</Text>
            </View>
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }}
            >
                {item.status === 'COMPLETED' && (
                    <Button
                        type="clear"
                        title="View"
                        icon={{
                            name: 'eye-arrow-right-outline',
                            type: 'material-community',
                            color: theme.theme.colors.primary,
                        }}
                        onPress={showItem}
                    />
                )}
                {item.status === 'IN_PROGRESS' && (
                    <>
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
                    </>
                )}
            </View>
        </View>
    );
}

export default InventoryReceiveItem;
