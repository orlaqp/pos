import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, useTheme } from '@rneui/themed';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { CustomerEntity, customersActions } from '@pos/customers/data-access';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

type CustomerStackParamList = {
    'Customer Form': undefined;
    'Customer Payment': undefined;
};

export interface CustomerItemProps {
    item: CustomerEntity;
    navigation: NativeStackNavigationProp<CustomerStackParamList>;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const formatCurrency = (value?: number | null) => currencyFormatter.format(value ?? 0);

const getDisplayName = (customer: CustomerEntity) =>
    customer.displayName ||
    [customer.firstName, customer.middleName, customer.lastName]
        .filter(Boolean)
        .join(' ') ||
    'Unnamed customer';

const getAvailableCredit = (customer: CustomerEntity) =>
    (customer.creditLimit ?? 0) - (customer.creditBalance ?? 0);

export function CustomerItem({ item, navigation }: CustomerItemProps) {
    const theme = useTheme();
    const shared = useSharedStyles();
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const dispatch = useDispatch();
    const active = item.active !== false;

    const openForm = () => {
        dispatch(customersActions.select(item));
        navigation.navigate('Customer Form');
    };

    const openPayment = () => {
        dispatch(customersActions.select(item));
        navigation.navigate('Customer Payment');
    };

    return (
        <TouchableOpacity
            testID={`customer-row-${item.id ?? item.firstName}`}
            style={[shared.dataRow, styles.row]}
            onPress={openForm}
        >
            <View style={styles.statusColumn}>
                <Text
                    style={[
                        shared.primaryText,
                        shared.textBold,
                        { color: active ? theme.theme.colors.success : theme.theme.colors.error },
                    ]}
                >
                    {active ? 'Active' : 'Inactive'}
                </Text>
                <Text style={shared.secondaryText}>{item.creditStatus || 'OK'}</Text>
            </View>

            <View style={styles.identityColumn}>
                <Text style={[shared.name, styles.nameText]} numberOfLines={1}>
                    {getDisplayName(item)}
                </Text>
                <Text style={shared.secondaryText} numberOfLines={1}>
                    {item.phone || 'No phone'}
                </Text>
                <Text style={shared.secondaryText} numberOfLines={1}>
                    {item.email || 'No email'}
                </Text>
            </View>

            <View style={styles.creditColumn}>
                <Text style={shared.primaryText}>
                    Balance {formatCurrency(item.creditBalance)}
                </Text>
                <Text style={shared.secondaryText}>
                    Available {formatCurrency(getAvailableCredit(item))}
                </Text>
            </View>

            <View style={styles.actionsColumn}>
                <Button
                    testID={`customer-payment-${item.id ?? item.firstName}`}
                    type="clear"
                    icon={{
                        name: 'cash-plus',
                        type: 'material-community',
                        color: theme.theme.colors.primary,
                    }}
                    buttonStyle={styles.actionButton}
                    onPress={openPayment}
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
        nameText: {
            marginBottom: 2,
        },
        creditColumn: {
            flex: 2,
            justifyContent: 'center',
            paddingRight: tokens.spacing.md,
        },
        actionsColumn: {
            width: 70,
            alignItems: 'flex-end',
            justifyContent: 'center',
        },
        actionButton: {
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#2F80ED55',
            backgroundColor: '#2F80ED12',
        },
    });

export default CustomerItem;
