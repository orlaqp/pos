import React, { useState } from 'react';

import { View, Text } from 'react-native';
import { theme, useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StarPrinter } from 'react-native-star-io10';
import { PrintingEntity } from '@pos/printings/data-access';
import { UILabel } from '@pos/shared/ui-native';

export interface PrinterItemProps {
    item: StarPrinter;
    navigation: NativeStackNavigationProp<any>;
    defaultPrinter?: PrintingEntity;
    setAsDefault: (printer: StarPrinter) => void;
}

function InfoBox(props: { label?: string; value?: string }) {
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
                    <InfoBox label="Model" value={item.information?.model} />
                </View>
                <View style={{ flex: 1 }}>
                    <InfoBox
                        label="Identifier"
                        value={item.connectionSettings.identifier}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <InfoBox
                        label="IP Address"
                        value={item.information?.reserved.get('ipAddress')}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <InfoBox
                        label="Interface"
                        value={item.connectionSettings.interfaceType}
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
                {!defaultPrinter && (
                    <Button
                        type="outline"
                        title="Set as Default"
                        onPress={() => setAsDefault(item)}
                    />
                )}
                {defaultPrinter && (
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
