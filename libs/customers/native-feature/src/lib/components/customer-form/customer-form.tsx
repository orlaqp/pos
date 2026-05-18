import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from '@rneui/themed';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { selectCurrentTenantId } from '@pos/auth/data-access';
import {
    CreditTransactionEntity,
    CustomerCreditService,
    CustomerEntity,
    CustomerService,
    customersActions,
    selectCustomerLedger,
    selectSelectedCustomer,
} from '@pos/customers/data-access';
import { selectLoginEmployee } from '@pos/employees/data-access';
import { CustomerCreditStatus } from '@pos/shared/models';
import {
    UIActions,
    UICard,
    UIDateTimeField,
    UIInput,
    UIScreen,
    UIStack,
    UISwitch,
} from '@pos/shared/ui-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import {
    canCreateCustomers,
    canManageCustomerCredit,
    canReceiveCustomerCreditPayments,
    CustomerPermissionSubject,
} from '../../customer-permissions';
import CustomerCreditHistory from '../customer-credit/customer-credit-history';

type CustomerStackParamList = {
    'Customer Payment': undefined;
};

export interface CustomerFormProps {
    customer?: CustomerEntity;
    tenantId?: string;
    currentEmployee?: CustomerPermissionSubject;
    navigation?: NativeStackNavigationProp<CustomerStackParamList>;
    onCancel?: () => void;
    onSaved?: (customer: CustomerEntity) => void;
}

type CustomerFormValues = CustomerEntity;

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const formatCurrency = (value?: number | null) => currencyFormatter.format(value ?? 0);

const getAvailableCredit = (customer?: CustomerEntity) =>
    (customer?.creditLimit ?? 0) - (customer?.creditBalance ?? 0);

const getCreditStatus = (customer?: CustomerEntity) =>
    (customer?.creditBalance ?? 0) > (customer?.creditLimit ?? 0)
        ? CustomerCreditStatus.OVER_LIMIT
        : CustomerCreditStatus.OK;

const getDisplayName = (customer?: CustomerEntity) =>
    customer
        ? customer.displayName ||
          [customer.firstName, customer.middleName, customer.lastName]
              .filter(Boolean)
              .join(' ') ||
          'Unnamed customer'
        : 'New customer';

const toAmount = (value?: string | number | null) => {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
};

export const getCustomerDefaults = (customer?: CustomerEntity): CustomerFormValues => ({
    id: customer?.id,
    tenantId: customer?.tenantId,
    firstName: customer?.firstName ?? '',
    lastName: customer?.lastName ?? '',
    middleName: customer?.middleName ?? '',
    dob: customer?.dob ?? '',
    phone: customer?.phone ?? '',
    email: customer?.email ?? '',
    active: customer?.active ?? true,
    creditLimit: customer?.creditLimit ?? 0,
    creditBalance: customer?.creditBalance ?? 0,
    creditStatus: customer?.creditStatus ?? CustomerCreditStatus.OK,
});

const getDuplicateContactMessage = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);

    if (message.toLowerCase().includes('already exists')) {
        return message;
    }

    if (message.toLowerCase().includes('phone or email')) {
        return 'Enter a phone number or email before saving this customer.';
    }

    return message || 'Unable to save customer.';
};

export function CustomerForm({
    customer,
    tenantId,
    currentEmployee,
    navigation,
    onCancel,
    onSaved,
}: CustomerFormProps) {
    const dispatch = useDispatch();
    const selectedCustomer = useSelector(selectSelectedCustomer);
    const loginEmployee = useSelector(selectLoginEmployee);
    const currentTenantId = useSelector(selectCurrentTenantId);
    const storedLedger = useSelector(selectCustomerLedger);
    const effectiveCustomer = customer ?? selectedCustomer;
    const effectiveEmployee = currentEmployee ?? loginEmployee;
    const effectiveTenantId = tenantId ?? effectiveCustomer?.tenantId ?? currentTenantId;
    const canCreate = canCreateCustomers(effectiveEmployee);
    const canManageCredit = canManageCustomerCredit(effectiveEmployee);
    const canReceivePayments = canReceiveCustomerCreditPayments(effectiveEmployee);
    const canEditCustomer = canCreate || canManageCredit;
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const [busy, setBusy] = useState(false);
    const [ledger, setLedger] = useState<CreditTransactionEntity[]>(storedLedger);
    const form = useForm<CustomerFormValues>({
        mode: 'onChange',
        defaultValues: getCustomerDefaults(effectiveCustomer),
    });
    const active = form.watch('active') !== false;
    const watchedLimit = toAmount(form.watch('creditLimit'));
    const watchedBalance = effectiveCustomer?.creditBalance ?? 0;
    const previewCustomer = {
        ...effectiveCustomer,
        creditLimit: watchedLimit,
        creditBalance: watchedBalance,
    };

    useEffect(() => {
        let mounted = true;

        if (!effectiveCustomer?.id) {
            setLedger([]);
            dispatch(customersActions.clearLedger());
            return () => {
                mounted = false;
            };
        }

        CustomerCreditService.getLedgerForCustomer(effectiveCustomer.id)
            .then((items) => {
                if (!mounted) return;
                setLedger(items);
                dispatch(customersActions.setLedger(items));
            })
            .catch(() => {
                if (!mounted) return;
                setLedger([]);
                dispatch(customersActions.clearLedger());
            });

        return () => {
            mounted = false;
        };
    }, [dispatch, effectiveCustomer?.id]);

    const cancel = () => {
        if (onCancel) {
            onCancel();
            return;
        }

        navigation?.goBack();
    };

    const openPayment = () => {
        if (!effectiveCustomer?.id) return;
        dispatch(customersActions.select(effectiveCustomer));
        navigation?.navigate('Customer Payment');
    };

    const save = async (values: CustomerFormValues) => {
        if (!effectiveCustomer?.id && !canCreate) {
            Alert.alert('Permission required', 'You do not have access to create customers.');
            return;
        }

        if (effectiveCustomer?.id && !canEditCustomer) {
            Alert.alert('Permission required', 'You do not have access to edit this customer.');
            return;
        }

        const trimmedFirstName = values.firstName?.trim();
        const phone = values.phone?.trim();
        const email = values.email?.trim();

        if (!trimmedFirstName) {
            Alert.alert('First name required', 'Enter a first name before saving this customer.');
            return;
        }

        if (!phone && !email) {
            Alert.alert('Contact required', 'Enter a phone number or email before saving this customer.');
            return;
        }

        const payload: CustomerEntity = {
            ...effectiveCustomer,
            id: effectiveCustomer?.id,
            tenantId: effectiveCustomer?.tenantId ?? effectiveTenantId,
            firstName: trimmedFirstName,
            lastName: values.lastName?.trim() || null,
            middleName: values.middleName?.trim() || null,
            phone: phone || null,
            email: email || null,
            dob: values.dob?.trim() || null,
            active: canManageCredit ? values.active ?? true : effectiveCustomer?.active ?? true,
            creditLimit: canManageCredit
                ? toAmount(values.creditLimit)
                : effectiveCustomer?.creditLimit ?? 0,
            creditBalance: effectiveCustomer?.creditBalance ?? 0,
        };

        payload.creditStatus = getCreditStatus(payload);

        if (!payload.id) {
            delete payload.id;
        }

        try {
            setBusy(true);
            const saved = await CustomerService.save(payload);
            dispatch(customersActions.upsert(saved));
            dispatch(customersActions.select(saved));
            onSaved?.(saved);
            if (!onSaved) navigation?.goBack();
        } catch (error) {
            Alert.alert('Customer not saved', getDuplicateContactMessage(error));
        } finally {
            setBusy(false);
        }
    };

    return (
        <UIScreen>
            <FormProvider {...form}>
                <View testID="customer-form-screen" style={styles.screen}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.container}>
                            <UICard style={styles.headerCard} tone="muted" radius="lg">
                                <View style={styles.headerRow}>
                                    <View style={styles.headerTitleBlock}>
                                        <Text style={styles.headerTitle}>
                                            {effectiveCustomer?.id ? 'Customer Profile' : 'Create Customer'}
                                        </Text>
                                        <Text style={styles.headerSubtitle}>
                                            Manage customer identity, contact details, and account credit.
                                        </Text>
                                    </View>
                                    <View style={styles.headerStatusBlock}>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                active
                                                    ? styles.statusBadgeActive
                                                    : styles.statusBadgeInactive,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.statusBadgeText,
                                                    active
                                                        ? styles.statusBadgeTextActive
                                                        : styles.statusBadgeTextInactive,
                                                ]}
                                            >
                                                {active ? 'Active' : 'Inactive'}
                                            </Text>
                                        </View>
                                        {canManageCredit ? (
                                            <View style={styles.statusSwitchRow}>
                                                <Text style={styles.toggleLabel}>Is active?</Text>
                                                <View style={styles.toggleSwitchWrap}>
                                                    <UISwitch
                                                        testID="customer-form-active"
                                                        name="active"
                                                    />
                                                </View>
                                            </View>
                                        ) : null}
                                    </View>
                                </View>
                            </UICard>

                            <UICard style={styles.sectionCard}>
                                <Text style={styles.sectionTitle}>Profile</Text>
                                <UIStack spacing="sm">
                                    <View style={styles.row}>
                                        <View style={styles.column}>
                                            <UIInput
                                                testID="customer-form-first-name"
                                                name="firstName"
                                                label="First Name"
                                                placeholder="First name"
                                                lIcon="account-outline"
                                            />
                                        </View>
                                        <View style={styles.columnLast}>
                                            <UIInput
                                                testID="customer-form-last-name"
                                                name="lastName"
                                                label="Last Name"
                                                placeholder="Last name"
                                                lIcon="account-outline"
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.row}>
                                        <View style={styles.column}>
                                            <UIInput
                                                testID="customer-form-phone"
                                                name="phone"
                                                label="Phone"
                                                placeholder="Phone Number"
                                                keyboardType="phone-pad"
                                                lIcon="phone-outline"
                                            />
                                        </View>
                                        <View style={styles.columnLast}>
                                            <UIInput
                                                testID="customer-form-email"
                                                name="email"
                                                label="Email"
                                                placeholder="Email Address"
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                autoCorrect={false}
                                                lIcon="email-outline"
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.row}>
                                        <View style={styles.column}>
                                            <UIDateTimeField
                                                name="dob"
                                                label="Date of Birth"
                                                placeholder="Select date"
                                                mode="date"
                                                title="Date of Birth"
                                                clearable
                                            />
                                        </View>
                                        <View style={styles.columnLast} />
                                    </View>
                                </UIStack>
                            </UICard>

                            <UICard style={styles.sectionCard}>
                                <View style={styles.sectionHeaderRow}>
                                    <View>
                                        <Text style={styles.sectionTitle}>Credit Account</Text>
                                        <Text style={styles.sectionSubtitle}>
                                            {getDisplayName(effectiveCustomer)}
                                        </Text>
                                    </View>
                                    {effectiveCustomer?.id && canReceivePayments ? (
                                        <Button
                                            testID="customer-form-receive-payment"
                                            title="Receive payment"
                                            type="outline"
                                            buttonStyle={styles.paymentButton}
                                            titleStyle={styles.paymentButtonText}
                                            onPress={openPayment}
                                        />
                                    ) : null}
                                </View>

                                <View style={styles.metricRow}>
                                    <View style={styles.metric}>
                                        <Text style={styles.metricLabel}>Balance</Text>
                                        <Text style={styles.metricValue}>
                                            {formatCurrency(effectiveCustomer?.creditBalance)}
                                        </Text>
                                    </View>
                                    <View style={styles.metric}>
                                        <Text style={styles.metricLabel}>Available</Text>
                                        <Text
                                            testID="customer-form-available-credit"
                                            style={styles.metricValue}
                                        >
                                            {formatCurrency(getAvailableCredit(previewCustomer))}
                                        </Text>
                                    </View>
                                    <View style={styles.metricLast}>
                                        <Text style={styles.metricLabel}>Status</Text>
                                        <Text
                                            testID="customer-form-credit-status"
                                            style={styles.metricValue}
                                        >
                                            {getCreditStatus(previewCustomer)}
                                        </Text>
                                    </View>
                                </View>

                                {canManageCredit ? (
                                    <View style={styles.row}>
                                        <View style={styles.column}>
                                            <UIInput
                                                testID="customer-form-credit-limit"
                                                name="creditLimit"
                                                label="Credit Limit"
                                                placeholder="0.00"
                                                keyboardType="decimal-pad"
                                                lIcon="cash-multiple"
                                            />
                                        </View>
                                        <View style={styles.columnLast} />
                                    </View>
                                ) : null}
                            </UICard>

                            {effectiveCustomer?.id ? (
                                <UICard style={styles.sectionCard}>
                                    <Text style={styles.sectionTitle}>Credit History</Text>
                                    <CustomerCreditHistory
                                        customerId={effectiveCustomer.id}
                                        transactions={ledger}
                                    />
                                </UICard>
                            ) : null}
                        </View>
                    </ScrollView>

                    <View style={styles.actionBar}>
                        <UICard tone="muted" style={styles.actionBarCard}>
                            <UIActions
                                busy={busy}
                                submitTestID="customer-form-save"
                                cancelTestID="customer-form-cancel"
                                submitAction={form.handleSubmit(save)}
                                cancelAction={cancel}
                            />
                        </UICard>
                    </View>
                </View>
            </FormProvider>
        </UIScreen>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: '#080B10',
        },
        scrollContent: {
            paddingHorizontal: tokens.spacing.xl,
            paddingTop: tokens.spacing.lg,
            paddingBottom: tokens.spacing.xl,
            alignItems: 'center',
        },
        container: {
            width: '100%',
            maxWidth: 1220,
        },
        headerCard: {
            marginBottom: tokens.spacing.lg,
            borderRadius: 26,
            borderColor: '#C7D0DB22',
            backgroundColor: '#080B10',
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        headerTitleBlock: {
            flex: 1,
            paddingRight: tokens.spacing.lg,
        },
        headerTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 28,
            fontWeight: '800',
        },
        headerSubtitle: {
            color: tokens.colors.textSecondary,
            marginTop: tokens.spacing.xs,
            fontSize: 15,
            lineHeight: 21,
        },
        headerStatusBlock: {
            alignItems: 'flex-end',
        },
        statusBadge: {
            borderRadius: tokens.radii.xl,
            borderWidth: 1,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.xs,
            marginBottom: tokens.spacing.sm,
        },
        statusBadgeActive: {
            backgroundColor: `${tokens.colors.success}33`,
            borderColor: `${tokens.colors.success}66`,
        },
        statusBadgeInactive: {
            backgroundColor: `${tokens.colors.danger}22`,
            borderColor: `${tokens.colors.danger}55`,
        },
        statusBadgeText: {
            fontSize: 12,
            fontWeight: '700',
            textTransform: 'uppercase',
        },
        statusBadgeTextActive: {
            color: tokens.colors.success,
        },
        statusBadgeTextInactive: {
            color: tokens.colors.danger,
        },
        statusSwitchRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        toggleLabel: {
            color: tokens.colors.textSecondary,
            fontSize: 16,
            fontWeight: '600',
        },
        toggleSwitchWrap: {
            marginLeft: tokens.spacing.md,
        },
        sectionCard: {
            marginBottom: tokens.spacing.lg,
            borderRadius: 24,
            borderColor: '#C7D0DB22',
            backgroundColor: '#0E141C',
        },
        sectionHeaderRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing.md,
        },
        sectionTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 19,
            fontWeight: '800',
            marginBottom: tokens.spacing.md,
        },
        sectionSubtitle: {
            color: tokens.colors.textMuted,
            fontSize: 14,
        },
        row: {
            flexDirection: 'row',
        },
        column: {
            flex: 1,
            marginRight: tokens.spacing.md,
        },
        columnLast: {
            flex: 1,
        },
        metricRow: {
            flexDirection: 'row',
            marginBottom: tokens.spacing.lg,
        },
        metric: {
            flex: 1,
            marginRight: tokens.spacing.md,
            borderRadius: tokens.radii.lg,
            borderWidth: 1,
            borderColor: '#C7D0DB22',
            backgroundColor: '#080B10',
            padding: tokens.spacing.md,
        },
        metricLast: {
            flex: 1,
            borderRadius: tokens.radii.lg,
            borderWidth: 1,
            borderColor: '#C7D0DB22',
            backgroundColor: '#080B10',
            padding: tokens.spacing.md,
        },
        metricLabel: {
            color: tokens.colors.textMuted,
            fontSize: 12,
            fontWeight: '700',
            textTransform: 'uppercase',
            marginBottom: 4,
        },
        metricValue: {
            color: tokens.colors.textPrimary,
            fontSize: 18,
            fontWeight: '800',
        },
        paymentButton: {
            borderRadius: tokens.radii.md,
            borderColor: tokens.colors.border,
            paddingHorizontal: tokens.spacing.md,
        },
        paymentButtonText: {
            color: tokens.colors.textSecondary,
            fontWeight: '600',
        },
        actionBar: {
            paddingHorizontal: tokens.spacing.xl,
            paddingBottom: tokens.spacing.md,
            paddingTop: tokens.spacing.xs,
        },
        actionBarCard: {
            maxWidth: 1220,
            alignSelf: 'center',
            width: '100%',
            borderRadius: 24,
            borderColor: '#C7D0DB22',
            backgroundColor: '#080B10',
        },
    });

export default CustomerForm;
