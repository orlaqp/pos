import React, { useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { CustomerEntity, CustomerService } from '@pos/customers/data-access';
import {
    canCreateCustomers,
    canManageCustomerCredit,
    CustomerPermissionSubject,
} from '../../customer-permissions';

export interface CustomerFormProps {
    customer?: CustomerEntity;
    tenantId?: string;
    currentEmployee?: CustomerPermissionSubject;
    onCancel?: () => void;
    onSaved?: (customer: CustomerEntity) => void;
}

const toText = (value?: string | number | null) =>
    value === null || value === undefined ? '' : String(value);

const toAmount = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

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
    onCancel,
    onSaved,
}: CustomerFormProps) {
    const canCreate = canCreateCustomers(currentEmployee);
    const canManageCredit = canManageCustomerCredit(currentEmployee);
    const canEditCustomer = canCreate || canManageCredit;
    const styles = useStyles();
    const [firstName, setFirstName] = useState(toText(customer?.firstName));
    const [lastName, setLastName] = useState(toText(customer?.lastName));
    const [phone, setPhone] = useState(toText(customer?.phone));
    const [email, setEmail] = useState(toText(customer?.email));
    const [dob, setDob] = useState(toText(customer?.dob));
    const [active, setActive] = useState(customer?.active ?? true);
    const [creditLimit, setCreditLimit] = useState(toText(customer?.creditLimit ?? 0));
    const [busy, setBusy] = useState(false);

    const save = async () => {
        if (!customer?.id && !canCreate) {
            Alert.alert(
                'Permission required',
                'You do not have access to create customers.'
            );
            return;
        }

        if (customer?.id && !canEditCustomer) {
            Alert.alert(
                'Permission required',
                'You do not have access to edit this customer.'
            );
            return;
        }

        const trimmedFirstName = firstName.trim();

        if (!trimmedFirstName) {
            Alert.alert(
                'First name required',
                'Enter a first name before saving this customer.'
            );
            return;
        }

        if (!phone.trim() && !email.trim()) {
            Alert.alert(
                'Contact required',
                'Enter a phone number or email before saving this customer.'
            );
            return;
        }

        const payload: CustomerEntity = {
            ...customer,
            tenantId: customer?.tenantId ?? tenantId,
            firstName: trimmedFirstName,
            lastName: lastName.trim() || null,
            phone: phone.trim() || null,
            email: email.trim() || null,
            dob: dob.trim() || null,
            active: canManageCredit ? active : customer?.active ?? true,
            creditLimit: canManageCredit ? toAmount(creditLimit) : customer?.creditLimit ?? 0,
        };

        if (!payload.id) {
            delete payload.id;
        }

        try {
            setBusy(true);
            const saved = await CustomerService.save(payload);
            onSaved?.(saved);
        } catch (error) {
            Alert.alert('Customer not saved', getDuplicateContactMessage(error));
        } finally {
            setBusy(false);
        }
    };

    return (
        <ScrollView
            testID="customer-form-screen"
            style={styles.scroll}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.header}>
                <Text style={styles.title}>
                    {customer?.id ? 'Edit customer' : 'Create customer'}
                </Text>
                <Text style={styles.subtitle}>
                    Manage contact details and account status.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Profile</Text>
                <TextInput
                    testID="customer-form-first-name"
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First name"
                    style={styles.input}
                />
                <TextInput
                    testID="customer-form-last-name"
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last name"
                    style={styles.input}
                />
                <TextInput
                    testID="customer-form-phone"
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Phone"
                    keyboardType="phone-pad"
                    style={styles.input}
                />
                <TextInput
                    testID="customer-form-email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                />
                <TextInput
                    testID="customer-form-dob"
                    value={dob}
                    onChangeText={setDob}
                    placeholder="Date of birth"
                    style={styles.input}
                />
            </View>

            {canManageCredit ? (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Credit account</Text>
                    <View style={styles.toggleRow}>
                        <View>
                            <Text style={styles.label}>Active</Text>
                            <Text style={styles.hint}>Allow this customer account to be used.</Text>
                        </View>
                        <Switch
                            testID="customer-form-active"
                            value={active}
                            onValueChange={setActive}
                        />
                    </View>
                    <TextInput
                        testID="customer-form-credit-limit"
                        value={creditLimit}
                        onChangeText={setCreditLimit}
                        placeholder="Credit limit"
                        keyboardType="decimal-pad"
                        style={styles.input}
                    />
                </View>
            ) : null}

            <View style={styles.actions}>
                {onCancel ? (
                    <Pressable
                        testID="customer-form-cancel"
                        onPress={onCancel}
                        style={[styles.button, styles.secondaryButton]}
                    >
                        <Text style={styles.secondaryButtonText}>Cancel</Text>
                    </Pressable>
                ) : null}
                <Pressable
                    testID="customer-form-save"
                    disabled={busy}
                    onPress={save}
                    style={[styles.button, styles.primaryButton, busy && styles.disabledButton]}
                >
                    <Text style={styles.primaryButtonText}>{busy ? 'Saving...' : 'Save'}</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const useStyles = () =>
    StyleSheet.create({
        scroll: {
            flex: 1,
            backgroundColor: '#080B10',
        },
        container: {
            padding: 20,
            backgroundColor: '#080B10',
        },
        header: {
            marginBottom: 18,
        },
        title: {
            color: '#F7FAFC',
            fontSize: 24,
            fontWeight: '800',
        },
        subtitle: {
            color: '#AAB6C5',
            marginTop: 4,
            fontSize: 14,
        },
        section: {
            backgroundColor: '#101821',
            borderColor: '#C7D0DB22',
            borderWidth: 1,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
        },
        sectionTitle: {
            color: '#F7FAFC',
            fontSize: 16,
            fontWeight: '800',
            marginBottom: 12,
        },
        input: {
            minHeight: 44,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#2A3544',
            backgroundColor: '#0B1119',
            color: '#F7FAFC',
            paddingHorizontal: 12,
            marginBottom: 10,
        },
        toggleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        label: {
            color: '#F7FAFC',
            fontWeight: '700',
        },
        hint: {
            color: '#8A98AA',
            marginTop: 2,
        },
        actions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
        button: {
            minHeight: 44,
            minWidth: 110,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 18,
            marginLeft: 10,
        },
        primaryButton: {
            backgroundColor: '#2F80ED',
        },
        secondaryButton: {
            borderWidth: 1,
            borderColor: '#2A3544',
        },
        disabledButton: {
            opacity: 0.6,
        },
        primaryButtonText: {
            color: '#FFFFFF',
            fontWeight: '800',
        },
        secondaryButtonText: {
            color: '#D9E2EC',
            fontWeight: '700',
        },
    });

export default CustomerForm;
