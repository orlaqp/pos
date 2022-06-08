
import React, { useState } from 'react';

import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import { unitOfMeasuresActions, UnitOfMeasureEntity, UnitOfMeasureService } from '@pos/unit-of-measures/data-access';
import { useDispatch } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface UnitOfMeasureItemProps {
    item: UnitOfMeasureEntity;
    navigation: NativeStackNavigationProp<any>;
}

export function UnitOfMeasureItem({ item, navigation }: UnitOfMeasureItemProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const dispatch = useDispatch();
    const [busy, setBusy] = useState<boolean>(false);

    const deleteItem = async () => {
        if (!item.id) return;

        setBusy(true);
        await UnitOfMeasureService.delete(item.id);
        setBusy(false);
        dispatch(unitOfMeasuresActions.remove(item.id));

    }

    const editItem = () => {
        if (item.name === 'ea') {
            Alert.alert('This item cannot be changed');
            return;
        }

        dispatch(unitOfMeasuresActions.select(item));
        navigation.navigate('UnitOfMeasure Form');
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
        <TouchableOpacity style={styles.dataRow} onPress={editItem}>
            { busy &&
            <ActivityIndicator size='small' />
            }
            <View style={{ flex: 5 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
            {/* <View
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
            </View> */}
        </TouchableOpacity>
    );
}

export default UnitOfMeasureItem;
