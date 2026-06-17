import React, { useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import {
    CreditTransactionEntity,
    CustomerCreditService,
    CustomerEntity,
} from '@pos/customers/data-access';
import { PaymentType } from '@pos/shared/models';
import {
    canReceiveCustomerCreditPayments,
    CustomerPermissionSubject,
} from '../../customer-permissions';

export interface CustomerAccountPaymentDialogProps {
    customer?: CustomerEntity;
    currentEmployee?: CustomerPermissionSubject & {
        id?: string;
        firstName?: string | null;
        lastName?: string | null;
    };
    tenantId?: string;
    onCancel?: () => void;
    onSaved?: (transaction: CreditTransactionEntity) => void;
    onPrintableReceipt?: (transaction: CreditTransactionEntity) => void;
}

const paymentOptions = [
    { label: 'Cash', value: PaymentType.CASH, testID: 'customer-payment-method-cash' },
    { label: 'Card', value: PaymentType.CC, testID: 'customer-payment-method-card' },
    { label: 'Check', value: PaymentType.CHECK, testID: 'customer-payment-method-check' },
    { label: 'EBT', value: PaymentType.EBT, testID: 'customer-payment-method-ebt' },
];

const toAmount = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const getEmployeeName = (
    employee?: CustomerAccountPaymentDialogProps['currentEmployee']
) =>
    [employee?.firstName, employee?.lastName]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(' ') || 'Unknown employee';

export function CustomerAccountPaymentDialog({
    customer,
    currentEmployee,
    tenantId,
    onCancel,
    onSaved,
    onPrintableReceipt,
}: CustomerAccountPaymentDialogProps) {
    const styles = useStyles();
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentType>(PaymentType.CASH);
    const [notes, setNotes] = useState('');
    const [busy, setBusy] = useState(false);

    if (!canReceiveCustomerCreditPayments(currentEmployee)) {
        return (
            <View style={styles.permission}>
                <Text style={styles.title}>Permission required</Text>
                <Text style={styles.muted}>
                    This employee cannot receive customer credit payments.
                </Text>
            </View>
        );
    }

    const recordPayment = async () => {
        if (!customer?.id) {
            Alert.alert('Customer required', 'Select a customer before recording a payment.');
            return;
        }

        const paymentAmount = toAmount(amount);
        if (paymentAmount <= 0) {
            Alert.alert('Amount required', 'Enter a payment amount greater than zero.');
            return;
        }

        try {
            setBusy(true);
            const transaction = await CustomerCreditService.recordAccountPayment({
                tenantId: customer.tenantId ?? tenantId,
                customerId: customer.id,
                amount: paymentAmount,
                paymentMethod,
                referenceKey: `account-payment-${Date.now()}`,
                employeeId: currentEmployee?.id ?? 'unknown',
                employeeName: getEmployeeName(currentEmployee),
                notes: notes.trim() || null,
            });
            onPrintableReceipt?.(transaction);
            onSaved?.(transaction);
        } catch (error) {
            Alert.alert(
                'Payment not recorded',
                error instanceof Error ? error.message : 'Unable to record payment.'
            );
        } finally {
            setBusy(false);
        }
    };

    const confirmAndRecord = () => {
        if (!customer?.id) {
            Alert.alert('Customer required', 'Select a customer before recording a payment.');
            return;
        }

        const paymentAmount = toAmount(amount);
        if (paymentAmount <= 0) {
            Alert.alert('Amount required', 'Enter a payment amount greater than zero.');
            return;
        }

        const balance = customer?.creditBalance ?? 0;

        if (paymentAmount > balance) {
            Alert.alert(
                'Confirm overpayment',
                'This payment is greater than the current balance.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Record payment', onPress: recordPayment },
                ]
            );
            return;
        }

        recordPayment();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Account payment</Text>
            <Text style={styles.muted}>
                {customer?.displayName || customer?.firstName || 'No customer selected'}
            </Text>
            <TextInput
                testID="customer-payment-amount"
                value={amount}
                onChangeText={setAmount}
                placeholder="Amount"
                keyboardType="decimal-pad"
                style={styles.input}
            />
            <View style={styles.methodRow}>
                {paymentOptions.map((option) => (
                    <Pressable
                        key={option.value}
                        testID={option.testID}
                        onPress={() => setPaymentMethod(option.value)}
                        style={[
                            styles.methodButton,
                            paymentMethod === option.value && styles.methodButtonActive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.methodText,
                                paymentMethod === option.value && styles.methodTextActive,
                            ]}
                        >
                            {option.label}
                        </Text>
                    </Pressable>
                ))}
            </View>
            <TextInput
                testID="customer-payment-notes"
                value={notes}
                onChangeText={setNotes}
                placeholder="Notes"
                style={[styles.input, styles.notes]}
                multiline
            />
            <View style={styles.actions}>
                {onCancel ? (
                    <Pressable
                        testID="customer-payment-cancel"
                        onPress={onCancel}
                        style={[styles.button, styles.secondaryButton]}
                    >
                        <Text style={styles.secondaryButtonText}>Cancel</Text>
                    </Pressable>
                ) : null}
                <Pressable
                    testID="customer-payment-save"
                    disabled={busy}
                    onPress={confirmAndRecord}
                    style={[styles.button, styles.primaryButton, busy && styles.disabledButton]}
                >
                    <Text style={styles.primaryButtonText}>
                        {busy ? 'Recording...' : 'Record payment'}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const useStyles = () =>
    StyleSheet.create({
        container: {
            borderWidth: 1,
            borderColor: '#C7D0DB22',
            borderRadius: 8,
            padding: 16,
            backgroundColor: '#101821',
        },
        permission: {
            borderWidth: 1,
            borderColor: '#2A3544',
            borderRadius: 8,
            padding: 16,
            backgroundColor: '#0B1119',
        },
        title: {
            color: '#F7FAFC',
            fontSize: 18,
            fontWeight: '800',
            marginBottom: 6,
        },
        muted: {
            color: '#AAB6C5',
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
        notes: {
            minHeight: 70,
            paddingTop: 10,
        },
        methodRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: 10,
        },
        methodButton: {
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#2A3544',
            paddingHorizontal: 12,
            paddingVertical: 9,
            marginRight: 8,
            marginBottom: 8,
        },
        methodButtonActive: {
            borderColor: '#2F80ED',
            backgroundColor: '#2F80ED22',
        },
        methodText: {
            color: '#AAB6C5',
            fontWeight: '700',
        },
        methodTextActive: {
            color: '#F7FAFC',
        },
        actions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
        },
        button: {
            minHeight: 44,
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

export default CustomerAccountPaymentDialog;
