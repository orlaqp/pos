
import React, { useState } from 'react';

import { Alert, View } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import {
    UIActions,
    UiFileUpload,
    UIInput,
    UIVerticalSpacer,
} from '@pos/shared/ui-native';
import { FormProvider, useForm } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import {
    OrderEntity,
    OrderService,
} from '@pos/orders/data-access';
import { RootState } from '@pos/store';
import { Order } from '@pos/shared/models';

export interface OrderFormParams {
    [name: string]: object | undefined;
    order: Order;
}

export interface OrderFormProps {
    navigation: NativeStackNavigationProp< OrderFormParams>;
}

export function OrderForm({ navigation }: OrderFormProps) {
    const order = useSelector((state: RootState) => state.orders.selected);
    const dispatch = useDispatch();
    const styles = useSharedStyles();
    const [busy, setBusy] = useState<boolean>(false);

    const save = async () => {
        setBusy(true);
        const formValues: OrderEntity = form.getValues();
        
        if (!formValues.id) {
            delete formValues.id;
        }

        await OrderService.save(dispatch, formValues);
        navigation.goBack();
        setBusy(false);
    };

    const form = useForm< OrderEntity >({
        mode: 'onChange',
        defaultValues: {
            id: order?.id,
            // TODO: Update the rest of the properties here
        },
    });

    const confirmCancel = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [
                { text: 'No' },
                { text: 'Yes', onPress: () => navigation.goBack() },
            ]
        );
    }

    return (
        <View style={[styles.page, styles.centeredHorizontally]}>
            <FormProvider {...form}>
                <View
                    style={{
                        width: '60%',
                        flexDirection: 'column',
                        marginTop: 50,
                    }}
                >
                    <UIInput name="name" placeholder="Name" />
                    <UIActions
                        busy={busy}
                        submitAction={form.handleSubmit(save)}
                        cancelAction={confirmCancel}
                    />
                </View>
            </FormProvider>
        </View>
    );
}

export default OrderForm;
