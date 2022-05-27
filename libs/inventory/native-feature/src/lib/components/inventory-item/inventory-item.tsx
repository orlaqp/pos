import React, { useEffect, useState } from 'react';

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
    const [count, setCount] = useState<string>(item.newCount.toString());
    const [comment, setComment] = useState<string | undefined>(item.comments || undefined);

    const confirmDeletion = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [{ text: 'No' }, { text: 'Yes', onPress: () => onDelete(item) }]
        );
    };

    const updateCount = (count: string) => {
        const validatedCount = count || '0';
        setCount(validatedCount);
        onUpdate({ ...item, newCount: +validatedCount });
    }
    const updateComment = (comments: string) => {
        setComment(comments);
        onUpdate({ ...item, comments });
    }

    return (
        <View style={[styles.smallDataRow, styles.centered]}>
            {busy && <ActivityIndicator size="small" />}
            <View style={{ flex: 4, flexDirection: 'row' }}>
                <Text style={styles.name}>{item.productName}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.current}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <TextInput
                    value={count}
                    onChangeText={setCount}
                    onBlur={(e) => updateCount(e.nativeEvent.text)}
                    style={[styles.input, { marginRight: 25 }]}
                    onFocus={() => count === '0' && setCount('')}
                />
            </View>
            <View style={{ flex: 3 }}>
                <TextInput
                    value={comment}
                    onChangeText={setComment}
                    onBlur={(e) => updateComment(e.nativeEvent.text)}
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
