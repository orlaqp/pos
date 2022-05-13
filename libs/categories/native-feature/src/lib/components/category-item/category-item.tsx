import React, { useState } from 'react';

import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import { categoriesActions, CategoryEntity, CategoryService } from '@pos/categories/data-access';
import { useDispatch } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UIS3Image } from '@pos/shared/ui-native';

export interface CategoryItemProps {
    item: CategoryEntity;
    navigation: NativeStackNavigationProp<any>;
}

export function CategoryItem({ item, navigation }: CategoryItemProps) {
    const theme = useTheme();
    const styles = useStyles();
    const dispatch = useDispatch();
    const [busy, setBusy] = useState<boolean>(false);

    const deleteItem = async () => {
        if (!item.id) return;

        setBusy(true);
        await CategoryService.delete(item.id);
        setBusy(false);
        dispatch(categoriesActions.remove(item.id));

    }

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
        <View style={styles.dataRow}>
            { busy &&
            <ActivityIndicator size='small' />
            }
            <UIS3Image s3Key={item.picture} width={50} height={50} />
            <View style={{ flex: 5 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
            <View
                style={{
                    flex: 2,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }}
            >
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
            </View>
        </View>
    );
}

const useStyles = () => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            name: {
                fontSize: 18,
                color: theme.theme.colors.grey0,
                marginBottom: 5,
            },
            description: {
                fontSize: 14,
                color: theme.theme.colors.grey3,
            },
        }),
    };
};

export default CategoryItem;
