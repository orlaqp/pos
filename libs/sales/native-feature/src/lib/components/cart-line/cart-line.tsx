import { CartItem } from '@pos/sales/data-access';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import React from 'react';

import { View, Text, TouchableOpacity, Alert } from 'react-native';

/* eslint-disable-next-line */
export interface CartLineProps {
    item: CartItem;
    onSelect: (item: CartItem) => void;
    onRemove: (item: CartItem) => void;
}

export function CartLine({ item, onRemove, onSelect }: CartLineProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    
    const confirmDeletion = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [
                { text: 'No' },
                { text: 'Yes', onPress: () => onRemove(item) },
            ]
        );
    }


    return (
        <TouchableOpacity
            style={{
                // ...styles.darkBackground,
                backgroundColor: item.quantity === 0 ? theme.theme.colors.error : theme.theme.colors.grey4,
                marginBottom: 5,
                paddingHorizontal: 10,
                paddingVertical: 15,
                borderRadius: 5,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
            }}
            onPress={() => onSelect(item)}
        >
            <View>
                <Text style={styles.primaryText}>{item.product.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                    <Text
                        style={[
                            styles.secondaryText,
                            { fontSize: 14, fontWeight: 'bold', marginTop: 5 },
                        ]}
                    >
                        $ {item.product.price.toFixed(2)}x
                        {`${item.quantity.toFixed(2)}${item.product.unitOfMeasure}`}
                    </Text>
                    <Text
                        style={[
                            styles.primaryText,
                            { fontSize: 20, fontWeight: 'bold', marginTop: 5 },
                        ]}
                    >
                        {'  '}(${' '}
                        {(item.product.price * item.quantity).toFixed(2)})
                    </Text>
                </View>
            </View>
            <View style={{ flexGrow: 1 }}></View>
            <Button
                type="clear"
                icon={{
                    name: 'trash-can',
                    type: 'material-community',
                    color: theme.theme.colors.grey2,
                }}
                onPress={confirmDeletion}
            />
        </TouchableOpacity>
    );
}

export default CartLine;
