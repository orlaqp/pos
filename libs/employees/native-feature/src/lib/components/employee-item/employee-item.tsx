import React, { useState } from 'react';

import {
    View,
    Text,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import {
    employeesActions,
    EmployeeEntity,
    EmployeeService,
} from '@pos/employees/data-access';
import { useDispatch } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface EmployeeItemProps {
    item: EmployeeEntity;
    navigation: NativeStackNavigationProp<any>;
}

export function EmployeeItem({ item, navigation }: EmployeeItemProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const dispatch = useDispatch();
    const [busy, setBusy] = useState<boolean>(false);

    const deleteItem = async () => {
        if (!item.id) return;

        setBusy(true);
        await EmployeeService.delete(item.id);
        setBusy(false);
        dispatch(employeesActions.remove(item.id));
    };

    const editItem = () => {
        dispatch(employeesActions.select(item));
        navigation.navigate('Employee Form');
    };

    const confirmDeletion = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [{ text: 'No' }, { text: 'Yes', onPress: () => deleteItem() }]
        );
    };

    return (
        <TouchableOpacity style={styles.dataRow} onPress={editItem}>
            {busy && <ActivityIndicator size="small" />}
            <View style={{ flex: 1 }}>
                <Text
                    style={[
                        styles.primaryText,
                        styles.textBold,
                        {
                            color: item.active
                                ? theme.theme.colors.success
                                : theme.theme.colors.error,
                        },
                    ]}
                >
                    {item.active ? 'Active' : 'Inactive' }
                </Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                    {item.code}
                </Text>
            </View>
            <View style={{ flex: 3 }}>
                <Text style={styles.name}>
                    {item.firstName} {item.lastName}
                </Text>
                <Text style={styles.secondaryText}>
                    {item?.roles?.join(', ')}
                </Text>
            </View>
            <View style={{ flex: 2 }}>
                <Text style={styles.primaryText}>{item.phone}</Text>
            </View>
            <View style={{ flex: 2 }}>
                <Text style={styles.primaryText}>{item.email}</Text>
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
                    icon={{
                        name: 'trash-can',
                        type: 'material-community',
                        color: theme.theme.colors.error,
                    }}
                    onPress={confirmDeletion}
                />
            </View>
        </TouchableOpacity>
    );
}

export default EmployeeItem;
