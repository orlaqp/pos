import React, { useState } from 'react';
import { useSharedStyles } from '@pos/theme/native';
import { Button, Overlay, useTheme } from '@rneui/themed';

import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { Controller, RegisterOptions, useFormContext } from 'react-hook-form';

export interface IdName {
    id?: string;
    name: string;
}

/* eslint-disable-next-line */
export interface UiOverlaySelectProps {
    name?: string;
    title: string;
    list: IdName[];
    selectedId: string | null | undefined;
    rules?: RegisterOptions;
    onSelection?: (item: IdName) => unknown;
}

export const UIOverlaySelect = React.forwardRef<typeof Overlay, UiOverlaySelectProps>(
    (props, ref) => {
        const { name, title, list, onSelection, rules } = props;
        const styles = useStyles();
        const [visible, setVisible] = useState(false);
        const [selected, setSelected] = useState<IdName>();
        const { control } = useFormContext();
        const options = list || [];

        const toggleOverlay = () => setVisible(!visible);
        const getSelected = (value: string) =>
            options.find((i) => i.id === value);
        const select = (item: IdName) => {
            setSelected(item);
            toggleOverlay();
            if (onSelection) onSelection(item);
        };

        if (name) {
            return (
                <Controller
                    control={control}
                    name={name}
                    render={({
                        field: { onChange, value, onBlur, ref },
                        fieldState: { isTouched, isDirty, error },
                    }) => (
                        <>
                            <Button
                                title={getSelected(value)?.name || title}
                                onPress={toggleOverlay}
                                buttonStyle={styles.button}
                                type={value ? 'solid' : 'outline'}
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
                                <View style={styles.overlayContent}>
                                    <FlatList
                                        data={options}
                                        keyExtractor={(item, index) =>
                                            `${item.id || item.name}-${index}`
                                        }
                                        ListEmptyComponent={
                                            <Text style={styles.emptyText}>
                                                No options available
                                            </Text>
                                        }
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={styles.dataRow}
                                                onPress={() => {
                                                    onChange(item.id);
                                                    select(item);
                                                }}
                                            >
                                                <Text style={styles.name}>
                                                    {item.name}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            </Overlay>
                        </>
                    )}
                    rules={rules}
                />
            );
        }

        return (
            <>
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
                    <View style={styles.overlayContent}>
                        <FlatList
                            data={options}
                            keyExtractor={(item, index) =>
                                `${item.id || item.name}-${index}`
                            }
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>
                                    No options available
                                </Text>
                            }
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.dataRow}
                                    onPress={() => select(item)}
                                >
                                    <Text style={styles.name}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </Overlay>
            </>
        );
    }
);

const useStyles = () => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return {
        ...StyleSheet.create({
            overlay: {
                backgroundColor: theme.theme.colors.background,
                width: 420,
                maxHeight: 520,
                borderRadius: 8,
            },
            overlayContent: {
                minHeight: 120,
            },
            emptyText: {
                color: theme.theme.colors.grey2,
                textAlign: 'center',
                paddingVertical: 20,
            },
            button: {
                margin: 10,
                borderRadius: 6,
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
