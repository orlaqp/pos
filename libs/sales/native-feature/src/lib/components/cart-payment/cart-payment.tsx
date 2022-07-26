import { PaymentEntity } from '@pos/orders/data-access';
import { CartPayment as ICartPayment } from '@pos/sales/data-access';
import { PaymentType } from '@pos/shared/models';
import {
    UINumericInput,
    UISwitch,
    UIVerticalSpacer,
} from '@pos/shared/ui-native';
import { round2Dec } from '@pos/shared/utils';
import { useSharedStyles } from '@pos/theme/native';
import { Button } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { View, Text, Alert } from 'react-native';

const PaymentMethod = {
    cc: 'Credit Card',
    cash: 'Cash',
    check: 'Check',
};

interface PaymentInfo {
    withcash: boolean;
    cash: number;
    withcheck: boolean;
    check: number;
    withcc: boolean;
    cc: number;
}

/* eslint-disable-next-line */
export interface CartPaymentProps {
    total: number;
    canReceiveChecks: boolean;
    onPaymentEntered: (payments: ICartPayment[]) => void;
}

export function CartPayment({ total, canReceiveChecks, onPaymentEntered }: CartPaymentProps) {
    const styles = useSharedStyles();
    const [formValue, setFormValue] = useState<PaymentInfo>();
    const form = useForm<PaymentInfo>({
        mode: 'onChange',
        defaultValues: {
            withcash: false,
            cash: 0,
            withcheck: false,
            check: 0,
            withcc: false,
            cc: 0,
        },
    });
    
    const paymentMethods = Object.keys(PaymentMethod).filter(x => x !== 'check' || canReceiveChecks)

    const completeOrder = (info: PaymentInfo) => {
        const result: ICartPayment[] = [];
        let received = 0;
        
        if (info.cash > 0) {
            result.push({ type: PaymentType.CASH, amount: +info.cash });
            received += +info.cash;
        }
        
        if (info.cc > 0) {
            result.push({ type: PaymentType.CC, amount: +info.cc });
            received += +info.cc;
        }

        if (info.check > 0) {
            result.push({ type: PaymentType.CHECK, amount: +info.check });
            received += +info.check;
        }

        if (round2Dec(received) < round2Dec(total)) {
            Alert.alert('Received payment cannot be less than the total');
            return;
        }

        onPaymentEntered(result);
    }

    const amountChanged = (type: string, amount: number) => {
        if (isNaN(amount)) return;

        const values: Record<string, string | number | boolean> = form.getValues();
        const selectedPaymentTypes =
                Object.keys(PaymentMethod).filter((m) => values[`with${m}`]);

        if (selectedPaymentTypes.length > 2) return;
        
        const delta = total - amount;
        const otherPaymentType = selectedPaymentTypes.filter(t => t !== type);

        form.setValue(`${otherPaymentType[0]}` as any, delta > 0 ? delta : 0);
    }

    useEffect(() => {
        const subscription = form.watch((value, { name, type }) => {
            if (!name?.startsWith('with')) return;

            const noPaymentTypeEntered = () =>
                !Object.keys(PaymentMethod).some((m) => value[m] > 0);
            const clearAllPayments = () =>
                Object.keys(PaymentMethod).forEach((m) => form.setValue(m, 0));

            setFormValue(value as any);
            const typeSelected = value[name!];
            const amountFieldName = name.replace('with', '');
            const currentVal = value[amountFieldName];

            if (typeSelected && currentVal !== total) {
                if (noPaymentTypeEntered()) {
                    form.setValue(amountFieldName, total.toFixed(2));
                } else {
                    clearAllPayments();
                }
            } else if (!typeSelected) {
                form.setValue(amountFieldName, 0);
                const selectedPayments = Object.keys(value).filter(
                    (x) => x.startsWith('with') && value[x] === true
                );

                if (selectedPayments.length === 1) {
                    form.setValue(selectedPayments[0].replace('with', ''), total);
                }

                console.log(selectedPayments);
                
            }

            console.log(value, name, type);
        });
        return () => subscription.unsubscribe();
    }, [form]);

    return (
        <View>
            <FormProvider {...form}>
                <View>
                    <Text
                        style={[
                            styles.primaryText,
                            styles.textCenter,
                            { fontSize: 32, marginBottom: 20 },
                        ]}
                    >
                        $ {total.toFixed(2)}
                    </Text>
                </View>
                {paymentMethods.map((m) => (
                    <View key={m} style={[styles.miniDataRow]}>
                        <View style={{ flex: 1, paddingLeft: 15 }}>
                            <UISwitch name={`with${m}`} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text
                                style={[
                                    formValue && formValue[`with${m}`]
                                        ? styles.primaryText
                                        : styles.veryLightText,
                                    { fontWeight: 'bold' },
                                ]}
                            >
                                {PaymentMethod[m]}
                            </Text>
                        </View>
                        <View style={{ flex: 2 }}>
                            <UINumericInput
                                keyboardType="decimal-pad"
                                name={m}
                                allowDecimals={true}
                                textAlign="right"
                                lIcon="currency-usd"
                                clearTextOnFocus={true}
                                disabled={!formValue || !formValue[`with${m}`]}
                                onChangeText={(text) => amountChanged(m, +text)}
                            />
                        </View>
                    </View>
                ))}
                <UIVerticalSpacer size="medium" />
                <View>
                    <Button
                        title="Complete Order"
                        icon={{
                            name: 'check',
                            type: 'material-community',
                            color: styles.primaryText.color,
                        }}
                        onPress={() => completeOrder(form.getValues())}
                    />
                </View>
            </FormProvider>
        </View>
    );
}

export default CartPayment;
