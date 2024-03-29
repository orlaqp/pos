import React, { useEffect, useState } from 'react';

import { View, Text, Alert } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import { InventoryCountLineDTO } from '@pos/inventory/data-access';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TextInput } from 'react-native-gesture-handler';

export interface InventoryCountLineProps {
    readOnly: boolean;
    item: InventoryCountLineDTO;
    navigation: NativeStackNavigationProp<any>;
    onUpdate: (item: InventoryCountLineDTO) => void;
    onDelete: (item: InventoryCountLineDTO) => void;
}

export function InventoryCountLine({
    readOnly,
    item,
    navigation,
    onUpdate,
    onDelete,
}: InventoryCountLineProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const [count, setCount] = useState<string | undefined>(item.newCount?.toString());
    const [comment, setComment] = useState<string | undefined>(
        item.comments || undefined
    );
    
    const originalCount = item.newCount;
    const originalComment = item.comments;

    const confirmDeletion = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [{ text: 'No' }, { text: 'Yes', onPress: () => onDelete(item) }]
        );
    };

    const updateCount = (count: string) => {
        if (!count) {
            setCount(originalCount?.toString());
            return;
        }

        setCount(count);
        onUpdate({ ...item, newCount: +count });
    };
    const updateComment = (finalComment: string) => {
        if ((!originalComment && !finalComment) || originalComment === finalComment) return;

        onUpdate({ ...item, comments: finalComment });
    };

    return (
        <View style={[styles.smallDataRow, styles.centered]}>
            <View style={{ flex: 4, flexDirection: 'row' }}>
                <Text style={styles.name}>{item.productName}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.current.toFixed(2)}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <TextInput
                    value={count}
                    onChangeText={(text) => { setCount(text); updateCount(text); }}
                    placeholder='#'
                    style={[
                        styles.input, styles.primaryText,
                        { marginRight: 25 },
                    ]}
                    onFocus={() => setCount('')}
                    // onBlur={(e) => updateCount(e.nativeEvent.text)}
                    editable={!readOnly}
                />
            </View>
            <View style={{ flex: 3 }}>
                <TextInput
                    value={comment}
                    onChangeText={setComment}
                    placeholder='comments ...'
                    onBlur={(e) => updateComment(e.nativeEvent.text)}
                    style={[styles.input, styles.primaryText]}
                    editable={!readOnly}
                />
            </View>
            { !readOnly &&
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
            }
        </View>
    );
}

export default InventoryCountLine;
