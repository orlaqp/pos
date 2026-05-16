import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
    CreditTransactionEntity,
    CustomerCreditService,
} from '@pos/customers/data-access';

export interface CustomerCreditHistoryProps {
    customerId?: string;
    transactions?: CreditTransactionEntity[];
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const formatCurrency = (value?: number | null) => currencyFormatter.format(value ?? 0);

const formatDate = (value?: string | null) => {
    if (!value) return 'No date';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

export function CustomerCreditHistory({
    customerId,
    transactions,
}: CustomerCreditHistoryProps) {
    const styles = useStyles();
    const [loadedLedger, setLoadedLedger] = useState<CreditTransactionEntity[]>([]);
    const ledger = transactions ?? loadedLedger;

    useEffect(() => {
        let mounted = true;

        if (transactions) {
            return () => {
                mounted = false;
            };
        }

        if (!customerId) {
            return () => {
                mounted = false;
            };
        }

        CustomerCreditService.getLedgerForCustomer(customerId)
            .then((items) => {
                if (mounted) setLoadedLedger(items);
            })
            .catch(() => {
                if (mounted) setLoadedLedger([]);
            });

        return () => {
            mounted = false;
        };
    }, [customerId, transactions]);

    if (!customerId && !ledger.length) {
        return (
            <View style={styles.empty}>
                <Text style={styles.emptyText}>Select a customer to view credit history.</Text>
            </View>
        );
    }

    if (!ledger.length) {
        return (
            <View style={styles.empty}>
                <Text style={styles.emptyText}>No credit history yet.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container} testID="customer-credit-history">
            {ledger.map((transaction) => (
                <View key={transaction.id ?? transaction.referenceKey} style={styles.row}>
                    <View style={styles.rowHeader}>
                        <Text style={styles.type}>{String(transaction.type)}</Text>
                        <Text style={styles.amount}>{formatCurrency(transaction.amount)}</Text>
                    </View>
                    <Text style={styles.meta}>{formatDate(transaction.transactionDate)}</Text>
                    <Text style={styles.meta}>
                        Balance after {formatCurrency(transaction.balanceAfter)}
                    </Text>
                    <Text style={styles.meta}>
                        Employee {transaction.employeeName || transaction.employeeId || 'Unknown'}
                    </Text>
                    {transaction.paymentMethod ? (
                        <Text style={styles.meta}>Method {String(transaction.paymentMethod)}</Text>
                    ) : null}
                    {transaction.orderNo || transaction.orderId ? (
                        <Text style={styles.meta}>
                            Order {transaction.orderNo || transaction.orderId}
                        </Text>
                    ) : null}
                    <Text style={styles.meta}>Reference {transaction.referenceKey}</Text>
                    {transaction.notes ? (
                        <Text style={styles.notes}>{transaction.notes}</Text>
                    ) : null}
                </View>
            ))}
        </View>
    );
}

const useStyles = () =>
    StyleSheet.create({
        container: {
            gap: 10,
        },
        row: {
            borderWidth: 1,
            borderColor: '#2A3544',
            borderRadius: 8,
            padding: 12,
            backgroundColor: '#0B1119',
        },
        rowHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
        },
        type: {
            color: '#F7FAFC',
            fontWeight: '800',
        },
        amount: {
            color: '#F7FAFC',
            fontWeight: '800',
        },
        meta: {
            color: '#AAB6C5',
            fontSize: 12,
            marginTop: 2,
        },
        notes: {
            color: '#D9E2EC',
            marginTop: 6,
        },
        empty: {
            borderWidth: 1,
            borderColor: '#2A3544',
            borderRadius: 8,
            padding: 16,
            backgroundColor: '#0B1119',
        },
        emptyText: {
            color: '#AAB6C5',
        },
    });

export default CustomerCreditHistory;
