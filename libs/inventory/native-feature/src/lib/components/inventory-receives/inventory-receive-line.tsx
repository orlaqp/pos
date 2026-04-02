import React, { useRef, useState } from 'react';

import { View, Text, Alert } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import { InventoryReceiveLineDTO } from '@pos/inventory/data-access';
import { TextInput } from 'react-native-gesture-handler';

export interface InventoryReceiveLineProps {
    readOnly: boolean;
    item: InventoryReceiveLineDTO;
    onUpdate: (item: InventoryReceiveLineDTO) => void;
    onDelete: (item: InventoryReceiveLineDTO) => void;
}

const toTestKey = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export function InventoryReceiveLine({
    readOnly,
    item,
    onUpdate,
    onDelete,
}: InventoryReceiveLineProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const [received, setReceived] = useState<string>(item.received.toString());
    const [comment, setComment] = useState<string | undefined>(
        item.comments || undefined
    );
    const receivedRef = useRef<string>(item.received.toString());
    const productKey = toTestKey(item.productName);
    
    const originalReceived = item.received;

    const confirmDeletion = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [{ text: 'No' }, { text: 'Yes', onPress: () => onDelete(item) }]
        );
    };

    const updateReceived = (received: string) => {
        const validatedReceive = received || originalReceived?.toString();
        receivedRef.current = validatedReceive;
        setReceived(validatedReceive);
        onUpdate({ ...item, received: +validatedReceive });
    };

    const updateComment = (comments: string) => {
        setComment(comments);
        onUpdate({ ...item, comments });
    };

    return (
        <View style={[styles.smallDataRow, styles.centered]}>
            <View style={{ flex: 4, flexDirection: 'row' }}>
                <Text style={styles.name}>{item.productName}</Text>
            </View>
            {/* <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.received}</Text>
            </View> */}
            <View style={{ flex: 1 }}>
                <TextInput
                    testID={`inventory-receive-qty-${productKey}`}
                    value={received}
                    onChangeText={(value) => {
                        receivedRef.current = value;
                        setReceived(value);
                        if (!value) return;

                        const parsed = +value;
                        if (Number.isNaN(parsed)) return;
                        onUpdate({ ...item, received: parsed });
                    }}
                    style={[
                        styles.input, styles.primaryText,
                        { marginRight: 25 },
                    ]}
                    onFocus={() => {
                        receivedRef.current = '';
                        setReceived('');
                        onUpdate({ ...item, received: 0 });
                    }}
                    onBlur={() => updateReceived(receivedRef.current)}
                    editable={!readOnly}
                />
            </View>
            <View style={{ flex: 3 }}>
                <TextInput
                    value={comment}
                    onChangeText={setComment}
                    onBlur={() => updateComment(comment || '')}
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

export default InventoryReceiveLine;
