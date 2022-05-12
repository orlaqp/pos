import React, { useState } from 'react';
import { theme, useSharedStyles } from '@pos/theme/native';
import { Button, Icon, Overlay, useTheme } from '@rneui/themed';

import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

export interface IdName {
    id?: string;
    name: string;
}

/* eslint-disable-next-line */
export interface UiOverlaySelectProps {
    title: string;
    list: IdName[];
    onSelection: (item: IdName) => unknown;
}

export function UiOverlaySelect({ title, list, onSelection }: UiOverlaySelectProps) {
    const styles = useStyles();
    const [visible, setVisible] = useState(false);
    const [selected, setSelected] = useState<IdName>();
    const toggleOverlay = () => setVisible(!visible);

    const select = (item: IdName) => {
        setSelected(item);
        onSelection(item);
        toggleOverlay();
    }

    return (
        <View>
            <Button
                title={selected?.name || title}
                onPress={toggleOverlay}
                buttonStyle={styles.button}
                type={selected ? 'solid' : 'outline'}
                titleStyle={{
                    fontSize: 12,
                    paddingLeft: 15,
                    paddingRight: 15,
                }}
            />
            <Overlay
                isVisible={visible}
                onBackdropPress={toggleOverlay}
                overlayStyle={styles.overlay}
            >
                <View >
                <FlatList
                    data={list}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.dataRow}
                            onPress={() => select(item) }
                        >
                            <Text style={styles.name}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
                </View>
            </Overlay>
        </View>
    );
}

const useStyles = () => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return {
        ...StyleSheet.create({
            overlay: {
                backgroundColor: theme.theme.colors.background
            },
            button: {
                margin: 10,
            },
            name: {
                color: theme.theme.colors.grey1,
            },
            dataRow: {
                ...sharedStyles.row,
                ...sharedStyles.darkBackground,
                padding: 10,
                borderRadius: 5,
                marginBottom: 5,
            },
        }),
    };
};

export default UiOverlaySelect;
