import { selectAllEvents } from '@pos/shared/data-store';
import { useSharedStyles } from '@pos/theme/native';
import React from 'react';

import { View, Text, FlatList } from 'react-native';
import { useSelector } from 'react-redux';

/* eslint-disable-next-line */
export interface LogListProps {}

export function LogList(props: LogListProps) {
    const styles = useSharedStyles();
    const events = useSelector(selectAllEvents);
    
    return (
        <View style={styles.page}>
            <FlatList data={events} renderItem={(info) => (
                <View style={styles.dataRow}>
                    <View style={{ flex: 2 }}>
                        <Text style={styles.primaryText}>{info.item.event}</Text>
                        <Text style={styles.secondaryText}>{info.item.timestamp}</Text>
                    </View>
                    <View style={{ flex: 4 }}>
                        <Text style={styles.secondaryText}>{info.item.data}</Text>
                    </View>
                </View>
            )} />
        </View>
    );
}

export default LogList;
