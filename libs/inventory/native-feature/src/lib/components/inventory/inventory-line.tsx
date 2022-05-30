import React, { useCallback, useEffect, useState } from 'react';

import { View, Text } from 'react-native';
import { theme, useSharedStyles } from '@pos/theme/native';
import { TextInput } from 'react-native-gesture-handler';
import { ProductEntity } from '@pos/products/data-access';
import { useTheme } from '@rneui/themed';
import { debounce } from 'lodash';
import { OrderService } from '@pos/orders/data-access';

export interface InventoryLineProps {
    item: ProductEntity;
}

export function InventoryLine({ item }: InventoryLineProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const [reorderPoint, setReorderPoint] = useState<string | null | undefined>(item.reorderPoint?.toString());
    const prevReorderPoint = item.reorderPoint;
    const [reorderQuantity, setReorderQuantity] = useState<string | null | undefined>(item.reorderQuantity?.toString());
    const prevReorderQuantity = item.reorderPoint;

    const updateReorderPoint = (text: string) => {
        debugger;
        const value = +text;
        if (!text || !value) {
            setReorderPoint(prevReorderPoint?.toString());
            return;
        }

        setReorderPoint(text);
        debouncedOnReorderPointChange(value);
    };

    const debouncedOnReorderPointChange = useCallback(
        debounce((value: number) => {
            OrderService.updateReorderPoint(item.id, value);
        }, 300),
        []
    );


    const updateReorderQuantity = (text: string) => {
        const value = +text;
        if (!text || !value) {
            setReorderQuantity(prevReorderQuantity?.toString());
            return;
        }

        setReorderQuantity(text);
        debouncedOnReorderQuantityChange(value);
    };

    const debouncedOnReorderQuantityChange = useCallback(
        debounce((value: number) => {
            OrderService.updateReorderQuantity(item.id, value);
        }, 300),
        []
    );

    return (
        <View
            style={[
                styles.smallDataRow,
                styles.centered,
                {
                    backgroundColor:
                        item.quantity <= +(reorderPoint || -1)
                            ? theme.theme.colors.error
                            : styles.smallDataRow.backgroundColor,
                    borderWidth: 1,
                },
            ]}
        >
            <View style={{ flex: 4, flexDirection: 'column' }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.secondaryText}>{item.description}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.quantity}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <TextInput
                    value={reorderPoint}
                    onChangeText={setReorderPoint}
                    style={[
                        styles.input,
                        styles.primaryText,
                        { marginRight: 25 },
                    ]}
                    onFocus={() => setReorderPoint('')}
                    onChange={(e) => updateReorderPoint(e.nativeEvent.text)}
                    onBlur={(e) => updateReorderPoint(e.nativeEvent.text)}
                />
            </View>
            <View style={{ flex: 1 }}>
                <TextInput
                    value={reorderQuantity}
                    onChangeText={setReorderQuantity}
                    style={[
                        styles.input,
                        styles.primaryText,
                        { marginRight: 25 },
                    ]}
                    onFocus={() => setReorderQuantity('')}
                    onChange={(e) => updateReorderQuantity(e.nativeEvent.text)}
                    onBlur={(e) => updateReorderQuantity(e.nativeEvent.text)}
                />
            </View>
        </View>
    );
}

export default InventoryLine;
