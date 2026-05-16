
import React, { useState } from 'react';

import { View, Text, Alert, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { translateWithFallback } from '@pos/shared/utils';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import { brandsActions, BrandEntity, BrandService } from '@pos/brands/data-access';
import { useDispatch } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

export interface BrandItemProps {
    item: BrandEntity;
    navigation: NativeStackNavigationProp<any>;
}

export const deleteBrandById = async (
    id: string | undefined,
    deleteBrand: (id: string) => Promise<any>,
    removeBrand: (id: string) => any
) => {
    if (!id) return false;
    await deleteBrand(id);
    removeBrand(id);
    return true;
};

export function BrandItem({ item, navigation }: BrandItemProps) {
    const t = translateWithFallback;
    const theme = useTheme();
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const dispatch = useDispatch();
    const [busy, setBusy] = useState<boolean>(false);

    const deleteItem = async () => {
        setBusy(true);
        await deleteBrandById(
            item.id,
            (id) => BrandService.delete(id),
            (id) => dispatch(brandsActions.remove(id))
        );
        setBusy(false);
    };

    const editItem = () => {
        dispatch(brandsActions.select(item));
        navigation.navigate('Brand Form');
    }

    const confirmDeletion = () => {
        Alert.alert(
            t('COMMON_AreYouSure', 'Are you sure?'),
            t('COMMON_UndoOperationWarning', 'You will not be able to undo this operation'),
            [
                { text: t('COMMON_No', 'No') },
                { text: t('COMMON_Yes', 'Yes'), onPress: () => deleteItem() },
            ]
        );
    }

    return (
        <TouchableOpacity style={[styles.dataRow, styles.row]} onPress={editItem}>
            { busy &&
            <ActivityIndicator size='small' />
            }
            <View style={styles.badgeSlot}>
                <View style={styles.initialBadge}>
                    <Text style={styles.initialText}>
                        {item.name?.slice(0, 2).toUpperCase()}
                    </Text>
                </View>
            </View>
            <View style={styles.contentColumn}>
                <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                    {item.name}
                </Text>
                <Text style={[styles.description, styles.secondaryReadable]} numberOfLines={1} ellipsizeMode="tail">
                    {item.description}
                </Text>
            </View>
            <View style={styles.actionsColumn}>
                {/* <Button
                    type="clear"
                    title="Edit"
                    icon={{
                        name: 'pencil-outline',
                        type: 'material-community',
                    }}
                    onPress={editItem}
                /> */}
                <Button
                    type="clear"
                    icon={{
                        name: 'trash-can',
                        type: 'material-community',
                        color: theme.theme.colors.error,
                    }}
                    buttonStyle={styles.deleteButton}
                    onPress={confirmDeletion}
                />
            </View>
        </TouchableOpacity>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            row: {
                alignItems: 'center',
                borderRadius: 22,
                borderWidth: 1,
                borderColor: '#C7D0DB22',
                backgroundColor: '#0E141C',
                marginBottom: tokens.spacing.sm,
                paddingHorizontal: tokens.spacing.md,
                paddingVertical: tokens.spacing.md,
            },
            badgeSlot: {
                width: 70,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: tokens.spacing.md,
            },
            initialBadge: {
                width: 44,
                height: 44,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: `${theme.theme.colors.primary}55`,
                backgroundColor: `${theme.theme.colors.primary}22`,
                alignItems: 'center',
                justifyContent: 'center',
            },
            initialText: {
                color: theme.theme.colors.primary,
                fontWeight: '700',
                letterSpacing: 0.5,
            },
            contentColumn: {
                flex: 1,
                paddingRight: tokens.spacing.md,
            },
            name: {
                color: theme.theme.colors.grey0,
                fontSize: 18,
                fontWeight: '800',
            },
            actionsColumn: {
                width: 70,
                alignItems: 'flex-end',
                justifyContent: 'center',
            },
            secondaryReadable: {
                color: theme.theme.colors.grey1,
            },
            deleteButton: {
                opacity: 0.95,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: `${theme.theme.colors.error}55`,
                backgroundColor: `${theme.theme.colors.error}12`,
            },
        }),
    };
};

export default BrandItem;
