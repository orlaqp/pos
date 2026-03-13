import React, { useState } from 'react';

import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import { categoriesActions, CategoryEntity, CategoryService } from '@pos/categories/data-access';
import { useDispatch } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UIS3Image } from '@pos/shared/ui-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

export interface CategoryItemProps {
    item: CategoryEntity;
    navigation: NativeStackNavigationProp<any>;
}

export const deleteCategoryById = async (
    id: string | undefined,
    deleteCategory: (id: string) => Promise<any>,
    removeCategory: (id: string) => any
) => {
    if (!id) return false;
    await deleteCategory(id);
    removeCategory(id);
    return true;
};

export function CategoryItem({ item, navigation }: CategoryItemProps) {
    const theme = useTheme();
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const dispatch = useDispatch();
    const [busy, setBusy] = useState<boolean>(false);

    const deleteItem = async () => {
        setBusy(true);
        await deleteCategoryById(
            item.id,
            (id) => CategoryService.delete(id),
            (id) => dispatch(categoriesActions.remove(id))
        );
        setBusy(false);
    };

    const editItem = () => {
        dispatch(categoriesActions.select(item));
        navigation.navigate('Category Form');
    }

    const confirmDeletion = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [
                { text: 'No' },
                { text: 'Yes', onPress: () => deleteItem() },
            ]
        );
    }

    return (
        <TouchableOpacity style={[styles.dataRow, styles.row]} onPress={editItem}>
            { busy &&
            <ActivityIndicator size='small' />
            }
            <View style={styles.thumbnailSlot}>
                <UIS3Image s3Key={item.picture} width={50} height={50} />
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
                paddingVertical: tokens.spacing.md,
            },
            thumbnailSlot: {
                width: 70,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: tokens.spacing.md,
            },
            contentColumn: {
                flex: 1,
                paddingRight: tokens.spacing.md,
            },
            actionsColumn: {
                width: 70,
                alignItems: 'flex-end',
                justifyContent: 'center',
            },
            name: {
                fontSize: 18,
                color: theme.theme.colors.grey0,
                marginBottom: 5,
            },
            description: {
                fontSize: 14,
                color: theme.theme.colors.grey3,
            },
            secondaryReadable: {
                color: theme.theme.colors.grey1,
            },
            deleteButton: {
                opacity: 0.75,
            },
        }),
    };
};

export default CategoryItem;
