import React from 'react';
import moment from 'moment';

import { View, Text, Alert, StyleSheet } from 'react-native';
import { getThemeColors, useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import {
    inventoryReceiveActions,
    InventoryReceiveDTO,
    InventoryReceiveService,
} from '@pos/inventory/data-access';
import { useAppDispatch } from '@pos/store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

type InventoryNavigationParams = Record<string, object | undefined>;

export interface InventoryItemProps {
    item: InventoryReceiveDTO;
    navigation: NativeStackNavigationProp<InventoryNavigationParams>;
}

export function InventoryReceiveItem({ item, navigation }: InventoryItemProps) {
    const theme = useTheme();
    const colors = getThemeColors(theme);
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const local = useStyles(tokens, colors);
    const dispatch = useAppDispatch();

    const editItem = () => {
        dispatch(inventoryReceiveActions.select(item));
        navigation.navigate('Inventory Receive Form');
    };

    const showItem = () => {
        dispatch(inventoryReceiveActions.select(item));
        navigation.navigate('Inventory Receive Form', { readOnly: true });
    };

    const deleteItem = async () => {
        if (!item.id) return;

        await InventoryReceiveService.delete(item.id);
        dispatch(inventoryReceiveActions.remove(item.id));
    };

    const confirmDeletion = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [{ text: 'No' }, { text: 'Yes', onPress: () => deleteItem() }]
        );
    };

    return (
        <View style={[styles.dataRow, local.row]}>
            <View style={local.identityColumn}>
                <Text style={styles.name}>{moment(item.createdAt).local().format('L LT')}</Text>
                <Text style={styles.secondaryText}>By: {item.createdBy?.name || 'N/A'}</Text>
            </View>
            <View style={local.statusColumn}>
                <View
                    style={[
                        local.statusBadge,
                        item.status === 'COMPLETED'
                            ? local.statusCompleted
                            : local.statusInProgress,
                    ]}
                >
                    <Text
                        style={[
                            local.statusText,
                            item.status === 'COMPLETED'
                                ? local.statusTextCompleted
                                : local.statusTextInProgress,
                        ]}
                    >
                        {item.status}
                    </Text>
                </View>
            </View>
            <View style={local.actionsColumn}>
                {item.status === 'COMPLETED' && (
                    <Button
                        type="clear"
                        title="View"
                        icon={{
                            name: 'eye-arrow-right-outline',
                            type: 'material-community',
                            color: theme.theme.colors.primary,
                        }}
                        onPress={showItem}
                    />
                )}
                {item.status === 'IN_PROGRESS' && (
                    <>
                        <Button
                            type="clear"
                            title="Edit"
                            icon={{
                                name: 'pencil-outline',
                                type: 'material-community',
                            }}
                            onPress={editItem}
                        />
                        <Button
                            type="clear"
                            icon={{
                                name: 'trash-can',
                                type: 'material-community',
                                color: theme.theme.colors.error,
                            }}
                            onPress={confirmDeletion}
                        />
                    </>
                )}
            </View>
        </View>
    );
}

const useStyles = (
    tokens: ReturnType<typeof useDesignTokens>,
    colors: ReturnType<typeof getThemeColors>
) =>
    StyleSheet.create({
        row: {
            alignItems: 'center',
            paddingVertical: tokens.spacing.md,
        },
        identityColumn: {
            flex: 4,
            paddingRight: tokens.spacing.md,
        },
        statusColumn: {
            flex: 2,
            alignItems: 'flex-start',
        },
        statusBadge: {
            borderRadius: tokens.radii.md,
            borderWidth: 1,
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: tokens.spacing.xs,
        },
        statusInProgress: {
            borderColor: `${colors.warning}66`,
            backgroundColor: `${colors.warning}22`,
        },
        statusCompleted: {
            borderColor: `${colors.success}66`,
            backgroundColor: `${colors.success}22`,
        },
        statusText: {
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 0.5,
        },
        statusTextInProgress: {
            color: colors.warning,
        },
        statusTextCompleted: {
            color: colors.success,
        },
        actionsColumn: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-end',
        },
    });

export default InventoryReceiveItem;
