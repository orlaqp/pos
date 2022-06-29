import React, { useState } from 'react';

import { View, Text } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrinterEntity } from '@pos/printings/data-access';

export interface PrinterItemProps {
    item: PrinterEntity;
    navigation: NativeStackNavigationProp<any>;
    defaultPrinter?: PrinterEntity;
    setAsDefault?: (printer: PrinterEntity) => void;
}

function InfoBox(props: { label?: string; value: string | null | undefined }) {
    const styles = useSharedStyles();

    return (
        <View style={{ flexDirection: 'column' }}>
            <Text style={[styles.secondaryText, { marginBottom: 5 }]}>
                {props.label}
            </Text>
            <Text style={styles.primaryText}>{props.value}</Text>
        </View>
    );
}

export function PrinterItem({
    item,
    navigation,
    defaultPrinter,
    setAsDefault,
}: PrinterItemProps) {
    const theme = useTheme();
    const styles = useSharedStyles();

    return (
        <View style={styles.dataRow}>
            <View style={{ flexDirection: 'row', flex: 6 }}>
                <View style={{ flex: 1 }}>
                    <InfoBox label="Model" value={item.model} />
                </View>
                <View style={{ flex: 1 }}>
                    <InfoBox
                        label="Identifier"
                        value={item.identifier}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <InfoBox
                        label="IP Address"
                        value={item.ip}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <InfoBox
                        label="Interface"
                        value={item.interfaceType}
                    />
                </View>
            </View>
            <View
                style={{
                    flex: 2,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }}
            >
                {(defaultPrinter?.identifier !== item.identifier) && setAsDefault && (
                    <Button
                        type="outline"
                        title="Set as Default"
                        onPress={() => setAsDefault(item)}
                    />
                )}
                {defaultPrinter?.identifier === item.identifier && (
                    <View
                        style={{
                            paddingVertical: 5,
                            paddingHorizontal: 10,
                            backgroundColor: theme.theme.colors.success,
                            justifyContent: 'center'
                        }}>
                        <Text style={{ color: theme.theme.colors.grey0 }}>
                            Default Printer
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
