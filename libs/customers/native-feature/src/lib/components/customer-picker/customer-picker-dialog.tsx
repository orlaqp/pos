import React, { useMemo, useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { CustomerEntity } from '@pos/customers/data-access';
import {
    canCreateCustomers,
    CustomerPermissionSubject,
} from '../../customer-permissions';
import CustomerForm from '../customer-form/customer-form';

export interface CustomerPickerDialogProps {
    visible?: boolean;
    customers?: CustomerEntity[];
    tenantId?: string;
    currentEmployee?: CustomerPermissionSubject;
    onClose?: () => void;
    onSelect?: (customer: CustomerEntity) => void;
    onCreated?: (customer: CustomerEntity) => void;
}

const getDisplayName = (customer: CustomerEntity) =>
    customer.displayName ||
    [customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
    'Unnamed customer';

export function CustomerPickerDialog({
    visible = true,
    customers = [],
    tenantId,
    currentEmployee,
    onClose,
    onSelect,
    onCreated,
}: CustomerPickerDialogProps) {
    const styles = useStyles();
    const [query, setQuery] = useState('');
    const [creating, setCreating] = useState(false);
    const canCreate = canCreateCustomers(currentEmployee);
    const filteredCustomers = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return customers;

        return customers.filter((customer) =>
            [
                customer.displayName,
                customer.firstName,
                customer.lastName,
                customer.phone,
                customer.email,
            ]
                .filter(Boolean)
                .some((value) => value?.toLowerCase().includes(normalized))
        );
    }, [customers, query]);

    const content = (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Select customer</Text>
                {canCreate ? (
                    <Pressable
                        testID="customer-picker-create"
                        style={styles.createButton}
                        onPress={() => setCreating(true)}
                    >
                        <Text style={styles.createButtonText}>New</Text>
                    </Pressable>
                ) : null}
            </View>

            {creating ? (
                <CustomerForm
                    tenantId={tenantId}
                    currentEmployee={currentEmployee}
                    onCancel={() => setCreating(false)}
                    onSaved={(customer) => {
                        setCreating(false);
                        onCreated?.(customer);
                        onSelect?.(customer);
                    }}
                />
            ) : (
                <>
                    <TextInput
                        testID="customer-picker-search"
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search customers"
                        style={styles.input}
                    />
                    <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
                        {filteredCustomers.map((customer) => (
                            <Pressable
                                key={customer.id ?? getDisplayName(customer)}
                                testID={`customer-picker-item-${customer.id ?? customer.firstName}`}
                                onPress={() => onSelect?.(customer)}
                                style={styles.row}
                            >
                                <Text style={styles.name}>{getDisplayName(customer)}</Text>
                                {customer.phone ? (
                                    <Text style={styles.meta}>{customer.phone}</Text>
                                ) : null}
                                {customer.email ? (
                                    <Text style={styles.meta}>{customer.email}</Text>
                                ) : null}
                            </Pressable>
                        ))}
                        {!filteredCustomers.length ? (
                            <Text style={styles.empty}>No matching customers.</Text>
                        ) : null}
                    </ScrollView>
                </>
            )}

            {onClose ? (
                <Pressable
                    testID="customer-picker-close"
                    onPress={onClose}
                    style={styles.closeButton}
                >
                    <Text style={styles.closeButtonText}>Close</Text>
                </Pressable>
            ) : null}
        </View>
    );

    if (!visible) {
        return null;
    }

    if (!onClose) {
        return content;
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalBackdrop}>{content}</View>
        </Modal>
    );
}

const useStyles = () =>
    StyleSheet.create({
        modalBackdrop: {
            flex: 1,
            backgroundColor: '#00000099',
            justifyContent: 'center',
            padding: 24,
        },
        container: {
            maxHeight: '90%',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#C7D0DB22',
            backgroundColor: '#101821',
            padding: 16,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        title: {
            color: '#F7FAFC',
            fontSize: 20,
            fontWeight: '800',
        },
        createButton: {
            borderRadius: 8,
            backgroundColor: '#2F80ED',
            paddingHorizontal: 14,
            paddingVertical: 9,
        },
        createButtonText: {
            color: '#FFFFFF',
            fontWeight: '800',
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
        list: {
            maxHeight: 420,
        },
        row: {
            borderWidth: 1,
            borderColor: '#2A3544',
            borderRadius: 8,
            padding: 12,
            marginBottom: 8,
            backgroundColor: '#0B1119',
        },
        name: {
            color: '#F7FAFC',
            fontWeight: '800',
        },
        meta: {
            color: '#AAB6C5',
            marginTop: 2,
        },
        empty: {
            color: '#AAB6C5',
            paddingVertical: 16,
            textAlign: 'center',
        },
        closeButton: {
            alignSelf: 'flex-end',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#2A3544',
            paddingHorizontal: 14,
            paddingVertical: 9,
            marginTop: 10,
        },
        closeButtonText: {
            color: '#D9E2EC',
            fontWeight: '700',
        },
    });

export default CustomerPickerDialog;
