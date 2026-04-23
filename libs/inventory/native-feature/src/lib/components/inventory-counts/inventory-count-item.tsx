import React from 'react';
import moment from 'moment';

import { View, Text, Alert, StyleSheet } from 'react-native';
import { getThemeColors } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import {
    inventoryCountActions,
    InventoryCountDTO,
    InventoryCountService,
} from '@pos/inventory/data-access';
import { useAppDispatch } from '@pos/store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

type InventoryNavigationParams = Record<string, object | undefined>;

export interface InventoryItemProps {
    item: InventoryCountDTO;
    navigation: NativeStackNavigationProp<InventoryNavigationParams>;
}

export function InventoryCountItem({ item, navigation }: InventoryItemProps) {
    const theme = useTheme();
    const colors = getThemeColors(theme);
    const tokens = useDesignTokens();
    const local = useStyles(tokens, colors);
    const dispatch = useAppDispatch();

    const editItem = () => {
        dispatch(inventoryCountActions.select(item));
        navigation.navigate('Inventory Count Form');
    };

    const showItem = () => {
        dispatch(inventoryCountActions.select(item));
        navigation.navigate('Inventory Count Form', { readOnly: true });
    };

    const deleteItem = async () => {
        if (!item.id) return;

        await InventoryCountService.delete(item.id);
        dispatch(inventoryCountActions.remove(item.id));
    };

    const confirmDeletion = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [{ text: 'No' }, { text: 'Yes', onPress: () => deleteItem() }]
        );
    };

    return (
        <View style={local.row}>
            <View style={local.identityColumn}>
                <Text style={local.eyebrow}>Inventory count</Text>
                <Text style={local.title}>{moment(item.createdAt).local().format('L LT')}</Text>
                <Text style={local.meta}>By {item.createdBy.name}</Text>
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
                        titleStyle={local.actionTitle}
                        buttonStyle={local.actionButton}
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
                            titleStyle={local.actionTitle}
                            buttonStyle={local.actionButton}
                        />
                        <Button
                            type="clear"
                            icon={{
                                name: 'trash-can',
                                type: 'material-community',
                                color: theme.theme.colors.error,
                            }}
                            onPress={confirmDeletion}
                            buttonStyle={[local.actionButton, local.dangerActionButton]}
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
            backgroundColor: '#0B1119',
            borderColor: '#1D2A3B',
            borderRadius: 20,
            borderWidth: 1,
            alignItems: 'center',
            flexDirection: 'row',
            marginBottom: tokens.spacing.sm,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.md,
        },
        identityColumn: {
            flex: 4,
            paddingRight: tokens.spacing.md,
        },
        eyebrow: {
            color: colors.primary,
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 1.4,
            marginBottom: 4,
            textTransform: 'uppercase',
        },
        title: {
            color: colors.grey0,
            fontSize: 18,
            fontWeight: '800',
        },
        meta: {
            color: colors.grey3,
            fontSize: 13,
            fontWeight: '700',
            marginTop: 4,
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
        actionButton: {
            borderRadius: 16,
            paddingHorizontal: tokens.spacing.sm,
        },
        dangerActionButton: {
            backgroundColor: '#2A1115',
            borderColor: `${colors.error}55`,
            borderWidth: 1,
        },
        actionTitle: {
            fontWeight: '800',
        },
    });

export default InventoryCountItem;
