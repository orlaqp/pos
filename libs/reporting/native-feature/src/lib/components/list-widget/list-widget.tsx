import { useSharedStyles } from '@pos/theme/native';
import React from 'react';

import { View, Text, FlatList } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

/* eslint-disable-next-line */
export interface ListWidgetProps {
    header: string;
    items: { name: string; value: string; }[]
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
            <ScrollView>
                {items.map((item, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', marginVertical: 8 }}>
                        <Text style={[styles.primaryText, { flex: 2 }]}>{item.name}</Text>
                    <Text style={[styles.primaryText, styles.textRight, { flex: 1 }]}>{item.value}</Text>
                </View>
                ))}
            </ScrollView>
        </View>
    );
}

export default ListWidget;
