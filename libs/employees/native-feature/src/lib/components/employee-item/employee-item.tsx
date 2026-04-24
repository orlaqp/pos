import React, { useState } from 'react';

import {
    View,
    Text,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { translateWithFallback } from '@pos/shared/utils';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import {
    employeesActions,
    EmployeeEntity,
    EmployeeService,
} from '@pos/employees/data-access';
import { useDispatch } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

export interface EmployeeItemProps {
    item: EmployeeEntity;
    navigation: NativeStackNavigationProp<any>;
}

export function EmployeeItem({ item, navigation }: EmployeeItemProps) {
    const t = translateWithFallback;
    const theme = useTheme();
    const tokens = useDesignTokens();
    const styles = useSharedStyles();
    const local = useStyles(tokens);
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
            t('COMMON_AreYouSure', 'Are you sure?'),
            t('COMMON_UndoOperationWarning', 'You will not be able to undo this operation'),
            [
                { text: t('COMMON_No', 'No') },
                { text: t('COMMON_Yes', 'Yes'), onPress: () => deleteItem() },
            ]
        );
    };

    return (
        <TouchableOpacity style={[styles.dataRow, local.row]} onPress={editItem}>
            {busy && <ActivityIndicator size="small" />}
            <View style={local.statusColumn}>
                <Text
                    style={[
                        styles.primaryText,
                        styles.textBold,
                        {
                            color: item.active
                                ? theme.theme.colors.success
                                : theme.theme.colors.error,
                        }
                    ]}
                >
                    {item.active
                        ? t('COMMON_Active', 'Active')
                        : t('COMMON_Inactive', 'Inactive')}
                </Text>
            </View>

            <View style={local.identityColumn}>
                <Text
                    style={[styles.secondaryText, local.codeText]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {t('COMMON_ById', `ID: ${item.code}`, { value: item.code })}
                </Text>
                <Text
                    style={[styles.name, local.nameText]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {item.firstName} {item.lastName}
                </Text>
                <Text
                    style={styles.secondaryText}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {item?.roles?.join(', ')}
                </Text>
            </View>

            <View style={local.contactColumn}>
                <Text
                    style={styles.primaryText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {item.phone}
                </Text>
                <Text
                    style={styles.secondaryText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {item.email}
                </Text>
            </View>

            <View style={local.actionsColumn}>
                <Button
                    type="clear"
                    icon={{
                        name: 'trash-can',
                        type: 'material-community',
                        color: theme.theme.colors.error,
                    }}
                    buttonStyle={local.deleteButton}
                    onPress={confirmDeletion}
                />
            </View>
        </TouchableOpacity>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
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
        statusColumn: {
            width: 110,
            justifyContent: 'center',
            paddingRight: tokens.spacing.md,
        },
        identityColumn: {
            flex: 3,
            justifyContent: 'center',
            paddingRight: tokens.spacing.md,
        },
        codeText: {
            marginBottom: 2,
        },
        nameText: {
            marginBottom: 2,
        },
        contactColumn: {
            flex: 2.5,
            justifyContent: 'center',
            paddingRight: tokens.spacing.md,
        },
        actionsColumn: {
            width: 70,
            alignItems: 'flex-end',
            justifyContent: 'center',
        },
        deleteButton: {
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#DC262655',
            backgroundColor: '#DC262612',
        },
    });

export default EmployeeItem;
