import React, { useState } from 'react';

import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, Input, useTheme } from '@rneui/themed';
import {
    inventoryCountActions,
    InventoryCountDTO,
    InventoryCountLineDTO,
    InventoryCountService,
} from '@pos/inventory/data-access';
import { useDispatch } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TextInput } from 'react-native-gesture-handler';

export interface InventoryItemProps {
    item: InventoryCountLineDTO;
    navigation: NativeStackNavigationProp<any>;
    onUpdate: (item: InventoryCountLineDTO) => void;
    onDelete: (item: InventoryCountLineDTO) => void;
}

export function InventoryItem({ item, navigation, onUpdate, onDelete }: InventoryItemProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const [busy, setBusy] = useState<boolean>(false);
    const [value, setValue] = useState<string>(item.newCount.toString());
    const [comment, setComment] = useState<string | undefined>(item.comments || undefined);

    const confirmDeletion = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [{ text: 'No' }, { text: 'Yes', onPress: () => onDelete(item) }]
        );
    };

    return (
        <View style={[styles.dataRow, styles.centered]}>
            {busy && <ActivityIndicator size="small" />}
            <View style={{ flex: 3, flexDirection: 'row' }}>
                <Text style={styles.name}>{item.productName}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.current}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <TextInput
                    value={value}
                    onChangeText={setValue}
                    style={[styles.input, { marginRight: 25 }]}
                />
            </View>
            <View style={{ flex: 3 }}>
                <TextInput
                    value={comment}
                    onChangeText={setComment}
                    style={styles.input}
                />
            </View>
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }}
            >
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
