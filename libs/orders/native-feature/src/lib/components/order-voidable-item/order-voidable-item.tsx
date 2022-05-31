import React, { useState } from 'react';

import { View, Text, TouchableOpacity } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { OrderLineEntity } from '@pos/orders/data-access';
import { useTheme } from '@rneui/themed';
import { EACH } from '@pos/unit-of-measures/data-access';

export interface CompactOrderItemProps {
    line: OrderLineEntity;
    onToggle: (line: OrderLineEntity, selected: boolean) => void;
}

export function OrderVoidableItem({ line, onToggle }: CompactOrderItemProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const [selected, setSelected] = useState<boolean>();

    const toggleSelection = () => {
        const newSelected = !selected;
        setSelected(newSelected);
        onToggle(line, newSelected);
    };

    return (
        <TouchableOpacity
            style={[
                styles.dataRow,
                {
                    backgroundColor: selected
                        ? theme.theme.colors.error
                        : styles.dataRow.backgroundColor,
                },
            ]}
            onPress={toggleSelection}
        >
            <View style={{ flex: 3 }}>
                <Text style={styles.name}>{line.productName}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                    {line.quantity}{' '}
                    {line.unitOfMeasure === EACH ? '' : line.unitOfMeasure}
                </Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.name, styles.textRight]}>
                    {(line.price * line.quantity).toFixed(2)}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

export default OrderVoidableItem;
