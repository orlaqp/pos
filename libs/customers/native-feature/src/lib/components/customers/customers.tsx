import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentTenantId } from '@pos/auth/data-access';
import { CustomerCreditStatus } from '@pos/shared/models';
import {
    CreditTransactionEntity,
    CustomerCreditService,
    CustomerEntity,
    CustomerService,
    customersActions,
    selectAllCustomers,
    selectCustomerLedger,
    selectSelectedCustomer,
} from '@pos/customers/data-access';
import { selectLoginEmployee } from '@pos/employees/data-access';
import CustomerCreditHistory from '../customer-credit/customer-credit-history';
import CustomerForm from '../customer-form/customer-form';
import CustomerAccountPaymentDialog from '../customer-credit/customer-account-payment-dialog';
import {
    canCreateCustomers,
    canManageCustomerCredit,
    canReceiveCustomerCreditPayments,
} from '../../customer-permissions';

export interface CustomersProps {
    tenantId?: string;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const formatCurrency = (value?: number | null) => currencyFormatter.format(value ?? 0);

const getAvailableCredit = (customer?: CustomerEntity) =>
    (customer?.creditLimit ?? 0) - (customer?.creditBalance ?? 0);

const getDisplayName = (customer?: CustomerEntity) =>
    customer
        ? customer.displayName ||
          [customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
          'Unnamed customer'
        : 'No customer selected';

export function Customers({ tenantId }: CustomersProps) {
    const styles = useStyles();
    const dispatch = useDispatch();
    const employee = useSelector(selectLoginEmployee);
    const currentTenantId = useSelector(selectCurrentTenantId);
    const storeCustomers = useSelector(selectAllCustomers);
    const storeSelectedCustomer = useSelector(selectSelectedCustomer);
    const storeLedger = useSelector(selectCustomerLedger);
    const [customers, setCustomers] = useState<CustomerEntity[]>(storeCustomers);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerEntity | undefined>(
        storeSelectedCustomer
    );
    const selectedCustomerIdRef = useRef(storeSelectedCustomer?.id);
    const [ledger, setLedger] = useState<CreditTransactionEntity[]>(storeLedger);
    const [query, setQuery] = useState('');
    const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'payment'>('list');
    const effectiveTenantId = tenantId ?? currentTenantId;

    const canCreate = canCreateCustomers(employee);
    const canManageCredit = canManageCustomerCredit(employee);
    const canReceivePayments = canReceiveCustomerCreditPayments(employee);
    const canEditCustomer = canCreate || canManageCredit;

    useEffect(() => {
        let mounted = true;

        CustomerService.getAll()
            .then((items) => {
                if (!mounted) return;
                setCustomers(items);
                dispatch(customersActions.setAll(items));

                const nextSelected = selectedCustomerIdRef.current
                    ? items.find((item) => item.id === selectedCustomerIdRef.current)
                    : items[0];

                if (nextSelected) {
                    selectedCustomerIdRef.current = nextSelected.id;
                    setSelectedCustomer(nextSelected);
                    dispatch(customersActions.select(nextSelected));
                }
            })
            .catch((error) => {
                Alert.alert(
                    'Customers not loaded',
                    error instanceof Error ? error.message : 'Unable to load customers.'
                );
            });

        return () => {
            mounted = false;
        };
    }, [dispatch]);

    useEffect(() => {
        let mounted = true;

        if (!selectedCustomer?.id) {
            dispatch(customersActions.clearLedger());
            return () => {
                mounted = false;
            };
        }

        CustomerCreditService.getLedgerForCustomer(selectedCustomer.id)
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
    }, [dispatch, selectedCustomer?.id]);

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

    const selectCustomer = (customer: CustomerEntity) => {
        selectedCustomerIdRef.current = customer.id;
        setSelectedCustomer(customer);
        dispatch(customersActions.select(customer));
        setMode('list');
    };

    const upsertCustomer = (customer: CustomerEntity) => {
        setCustomers((current) => {
            const exists = current.some((item) => item.id === customer.id);
            return exists
                ? current.map((item) => (item.id === customer.id ? customer : item))
                : [customer, ...current];
        });
        selectedCustomerIdRef.current = customer.id;
        setSelectedCustomer(customer);
        dispatch(customersActions.upsert(customer));
        dispatch(customersActions.select(customer));
        setMode('list');
    };

    const applyCreditTransaction = (transaction: CreditTransactionEntity) => {
        const updatedCustomer =
            selectedCustomer && selectedCustomer.id === transaction.customerId
                ? {
                      ...selectedCustomer,
                      creditBalance: transaction.balanceAfter,
                      creditStatus:
                          transaction.balanceAfter > (selectedCustomer.creditLimit ?? 0)
                              ? CustomerCreditStatus.OVER_LIMIT
                              : CustomerCreditStatus.OK,
                  }
                : selectedCustomer;

        if (updatedCustomer) {
            upsertCustomer(updatedCustomer);
        }

        setLedger((current) => [transaction, ...current]);
        dispatch(customersActions.addLedgerTransaction(transaction));
        setMode('list');
    };

    if (mode === 'create') {
        return (
            <CustomerForm
                tenantId={effectiveTenantId}
                currentEmployee={employee}
                onCancel={() => setMode('list')}
                onSaved={upsertCustomer}
            />
        );
    }

    if (mode === 'edit' && selectedCustomer) {
        return (
            <CustomerForm
                customer={selectedCustomer}
                tenantId={effectiveTenantId}
                currentEmployee={employee}
                onCancel={() => setMode('list')}
                onSaved={upsertCustomer}
            />
        );
    }

    if (mode === 'payment' && selectedCustomer) {
        return (
            <ScrollView contentContainerStyle={styles.screen}>
                <CustomerAccountPaymentDialog
                    customer={selectedCustomer}
                    tenantId={effectiveTenantId}
                    currentEmployee={employee}
                    onCancel={() => setMode('list')}
                    onSaved={applyCreditTransaction}
                />
            </ScrollView>
        );
    }

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Customers</Text>
                    <Text style={styles.subtitle}>
                        Search profiles, review balances, and manage credit accounts.
                    </Text>
                </View>
                {canCreate ? (
                    <Pressable
                        testID="customers-create"
                        onPress={() => setMode('create')}
                        style={styles.primaryButton}
                    >
                        <Text style={styles.primaryButtonText}>New customer</Text>
                    </Pressable>
                ) : null}
            </View>

            <View style={styles.body}>
                <View style={styles.listPanel}>
                    <TextInput
                        testID="customers-search"
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search customers"
                        style={styles.input}
                    />
                    <ScrollView keyboardShouldPersistTaps="handled">
                        {filteredCustomers.map((customer) => {
                            const selected = selectedCustomer?.id === customer.id;
                            return (
                                <Pressable
                                    key={customer.id ?? getDisplayName(customer)}
                                    testID={`customers-row-${customer.id ?? customer.firstName}`}
                                    onPress={() => selectCustomer(customer)}
                                    style={[styles.customerRow, selected && styles.customerRowActive]}
                                >
                                    <Text style={styles.customerName}>
                                        {getDisplayName(customer)}
                                    </Text>
                                    <Text style={styles.customerMeta}>
                                        {customer.phone || customer.email || 'No contact'}
                                    </Text>
                                    <Text style={styles.customerMeta}>
                                        Balance {formatCurrency(customer.creditBalance)}
                                    </Text>
                                </Pressable>
                            );
                        })}
                        {!filteredCustomers.length ? (
                            <Text style={styles.empty}>No customers found.</Text>
                        ) : null}
                    </ScrollView>
                </View>

                <ScrollView style={styles.detailPanel} keyboardShouldPersistTaps="handled">
                    <Text style={styles.sectionTitle}>Account summary</Text>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryName}>{getDisplayName(selectedCustomer)}</Text>
                        {selectedCustomer ? (
                            <>
                                <Text style={styles.summaryMeta}>
                                    Phone {selectedCustomer.phone || 'Not set'}
                                </Text>
                                <Text style={styles.summaryMeta}>
                                    Email {selectedCustomer.email || 'Not set'}
                                </Text>
                                <Text style={styles.summaryMeta}>
                                    Status {selectedCustomer.active === false ? 'Inactive' : 'Active'}
                                </Text>
                                <Text style={styles.summaryMeta}>
                                    Credit limit {formatCurrency(selectedCustomer.creditLimit)}
                                </Text>
                                <Text
                                    testID="customers-available-credit"
                                    style={styles.summaryMeta}
                                >
                                    Available credit {formatCurrency(getAvailableCredit(selectedCustomer))}
                                </Text>
                                <Text
                                    testID="customers-credit-status"
                                    style={styles.summaryMeta}
                                >
                                    Credit status {selectedCustomer.creditStatus || 'OK'}
                                </Text>
                                <Text style={styles.summaryBalance}>
                                    Balance {formatCurrency(selectedCustomer.creditBalance)}
                                </Text>
                                <View style={styles.detailActions}>
                                    {canEditCustomer ? (
                                        <Pressable
                                            testID="customers-edit"
                                            onPress={() => setMode('edit')}
                                            style={styles.secondaryButton}
                                        >
                                            <Text style={styles.secondaryButtonText}>
                                                {canManageCredit ? 'Edit customer' : 'Edit contact'}
                                            </Text>
                                        </Pressable>
                                    ) : null}
                                    {canReceivePayments ? (
                                        <Pressable
                                            testID="customers-payment"
                                            onPress={() => setMode('payment')}
                                            style={styles.primaryButton}
                                        >
                                            <Text style={styles.primaryButtonText}>
                                                Receive payment
                                            </Text>
                                        </Pressable>
                                    ) : null}
                                </View>
                            </>
                        ) : (
                            <Text style={styles.summaryMeta}>
                                Select a customer from the list to review account details.
                            </Text>
                        )}
                    </View>

                    <Text style={styles.sectionTitle}>Credit history</Text>
                    <CustomerCreditHistory
                        customerId={selectedCustomer?.id}
                        transactions={selectedCustomer ? ledger : []}
                    />
                </ScrollView>
            </View>
        </View>
    );
}

const useStyles = () =>
    StyleSheet.create({
        screen: {
            flex: 1,
            padding: 20,
            backgroundColor: '#080B10',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 18,
        },
        title: {
            color: '#F7FAFC',
            fontSize: 28,
            fontWeight: '800',
        },
        subtitle: {
            color: '#AAB6C5',
            marginTop: 4,
        },
        body: {
            flex: 1,
            flexDirection: 'row',
        },
        listPanel: {
            flex: 1,
            marginRight: 14,
            borderWidth: 1,
            borderColor: '#C7D0DB22',
            borderRadius: 8,
            backgroundColor: '#101821',
            padding: 12,
        },
        detailPanel: {
            flex: 1.35,
            borderWidth: 1,
            borderColor: '#C7D0DB22',
            borderRadius: 8,
            backgroundColor: '#101821',
            padding: 14,
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
        customerRow: {
            borderWidth: 1,
            borderColor: '#2A3544',
            borderRadius: 8,
            padding: 12,
            marginBottom: 8,
            backgroundColor: '#0B1119',
        },
        customerRowActive: {
            borderColor: '#2F80ED',
            backgroundColor: '#2F80ED22',
        },
        customerName: {
            color: '#F7FAFC',
            fontWeight: '800',
        },
        customerMeta: {
            color: '#AAB6C5',
            marginTop: 2,
        },
        empty: {
            color: '#AAB6C5',
            textAlign: 'center',
            paddingVertical: 20,
        },
        sectionTitle: {
            color: '#F7FAFC',
            fontSize: 17,
            fontWeight: '800',
            marginBottom: 10,
        },
        summaryCard: {
            borderWidth: 1,
            borderColor: '#2A3544',
            borderRadius: 8,
            padding: 14,
            backgroundColor: '#0B1119',
            marginBottom: 18,
        },
        summaryName: {
            color: '#F7FAFC',
            fontSize: 18,
            fontWeight: '800',
            marginBottom: 8,
        },
        summaryMeta: {
            color: '#AAB6C5',
            marginTop: 3,
        },
        summaryBalance: {
            color: '#F7FAFC',
            fontSize: 16,
            fontWeight: '800',
            marginTop: 10,
        },
        detailActions: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 14,
        },
        primaryButton: {
            minHeight: 42,
            borderRadius: 8,
            backgroundColor: '#2F80ED',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 14,
            marginLeft: 8,
        },
        primaryButtonText: {
            color: '#FFFFFF',
            fontWeight: '800',
        },
        secondaryButton: {
            minHeight: 42,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#2A3544',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 14,
        },
        secondaryButtonText: {
            color: '#D9E2EC',
            fontWeight: '700',
        },
    });

export default Customers;
