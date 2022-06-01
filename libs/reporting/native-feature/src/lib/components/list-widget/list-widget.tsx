import { useSharedStyles } from '@pos/theme/native';
import React from 'react';

import { View, Text, FlatList } from 'react-native';

/* eslint-disable-next-line */
export interface ListWidgetProps {
    header: string;
    items: { text: string; value: string; }[]
}

export function ListWidget({ header, items }: ListWidgetProps) {
    const styles = useSharedStyles();

    return (
        <View
            style={{
                borderRadius: 5,
                backgroundColor: styles.dataRow.backgroundColor,
                height: 220,
                paddingHorizontal: 20,
                paddingVertical: 10
            }}
        >
            <Text style={[styles.secondaryText, { marginBottom: 10 }]}>{header}</Text>
            <FlatList
                data={items}
                renderItem={(data) => (
                <View style={{ flexDirection: 'row', marginVertical: 8 }}>
                    <Text style={[styles.primaryText, { flex: 2 }]}>{data.item.text}</Text>
                    <Text style={[styles.primaryText, styles.textRight, { flex: 1 }]}>{data.item.value}</Text>
                </View>
            )}
            />
        </View>
    );
}

export default ListWidget;
