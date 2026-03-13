
import React from 'react';

import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { unitOfMeasuresActions, UnitOfMeasureEntity } from '@pos/unit-of-measures/data-access';
import { useDispatch } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface UnitOfMeasureItemProps {
    item: UnitOfMeasureEntity;
    navigation: NativeStackNavigationProp<any>;
}

export function UnitOfMeasureItem({ item, navigation }: UnitOfMeasureItemProps) {
    const styles = useSharedStyles();
    const dispatch = useDispatch();

    const editItem = () => {
        if (item.name === 'ea') {
            Alert.alert('This item cannot be changed');
            return;
        }

        dispatch(unitOfMeasuresActions.select(item));
        navigation.navigate('UnitOfMeasure Form');
    }

    return (
        <TouchableOpacity style={styles.dataRow} onPress={editItem}>
            <View style={{ flex: 5 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        </TouchableOpacity>
    );
}

export default UnitOfMeasureItem;
