import { PaymentEntity } from '@pos/orders/data-access';
import { PaymentType } from '@pos/shared/models';
import {
    UINumericInput,
    UISwitch,
    UIVerticalSpacer,
} from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { View, Text } from 'react-native';

const PaymentMethod = {
    cc: 'Credit Card',
    cash: 'Cash',
    check: 'Check',
};

export interface PaymentInfo {
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
    onPaymentEntered: (info: PaymentInfo) => void;
}

export function CartPayment({ total, onPaymentEntered }: CartPaymentProps) {
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
                    form.setValue(amountFieldName, total);
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

    const onMethodChange = (method: string, active: boolean) => {};

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
                        Payment type(s):
                    </Text>
                </View>
                {Object.keys(PaymentMethod).map((m) => (
                    <View key={m} style={[styles.miniDataRow]}>
                        <View style={{ flex: 1, paddingLeft: 15 }}>
                            <UISwitch name={`with${m}`} />
                            {/* <Switch
                                onValueChange={(value) =>
                                    onMethodChange(m, value)
                                }
                            /> */}
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
                                disabled={!formValue || !formValue[`with${m}`]}
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
                        onPress={() => onPaymentEntered(form.getValues())}
                    />
                </View>
            </FormProvider>
        </View>
    );
}

export default CartPayment;
