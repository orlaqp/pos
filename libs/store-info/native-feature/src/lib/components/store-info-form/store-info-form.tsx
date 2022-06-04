import { UIActions, UIInput } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { fetchStoreInfo, selectStore, StoreInfoEntity, StoreInfoService } from '@pos/store-info/data-access';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { View, Text, Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

/* eslint-disable-next-line */
export interface StoreInfoFormProps {
    navigation: NativeStackNavigationProp<any>;
}

export function StoreInfoForm({ navigation }: StoreInfoFormProps) {
    const styles = useSharedStyles();
    const storeInfo = useSelector(selectStore);
    const dispatch = useDispatch();
    const [busy, setBusy] = useState<boolean>(false);

    const save = async () => {
        setBusy(true);
        const formValues: StoreInfoEntity = form.getValues();
        
        if (!formValues.id) {
            delete formValues.id;
        }

        await StoreInfoService.save(dispatch, formValues);
        // navigation.goBack();
        Alert.alert('Store information has been updated');
        setBusy(false);
    };

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

    const form = useForm< StoreInfoEntity >({
        mode: 'onChange',
        defaultValues: {
            id: storeInfo?.id,
            name: storeInfo?.name,
            address: storeInfo?.address,
            city: storeInfo?.city,
            state: storeInfo?.state,
            zipCode: storeInfo?.zipCode,
            country: 'USA',
            email: storeInfo?.email,
            phone: storeInfo?.phone,
            fax: storeInfo?.fax,
            disclaimer: storeInfo?.disclaimer,
        },
    });

    useEffect(() => {
        dispatch(fetchStoreInfo());
    }, [dispatch]);
    
    return (
        <View style={[styles.page, styles.centeredHorizontally]}>
            <FormProvider {...form}>
                <ScrollView
                    style={{
                        width: '60%',
                        flexDirection: 'column',
                        marginTop: 50,
                    }}
                >
                    <UIInput name="name" label="Name" placeholder="Name" rules={{ required: true }} />
                    <UIInput name="address" label="Address" placeholder="Address" rules={{ required: true }} />
                    <UIInput name="city" label="City" placeholder="City" rules={{ required: true }} />
                    <UIInput name="state" label="State" placeholder="State" rules={{ required: true }} />
                    <UIInput name="zipCode" label="Zip Code" placeholder="Zip Code" rules={{ required: true }} />
                    <UIInput name="email" label="Email" placeholder="Email" rules={{ required: true }} />
                    <UIInput name="phone" label="Phone" placeholder="Phone" rules={{ required: true }} />
                    <UIInput name="fax" label="Fax" placeholder="Fax" rules={{ required: true }} />
                    <UIInput
                        name="disclaimer"
                        placeholder="Disclaimer"
                        multiline={true}
                        numberOfLines={2}
                        style={{ height: 80, textAlignVertical: 'top' }}
                    />
                    
                    <UIActions
                        busy={busy}
                        submitAction={form.handleSubmit(save)}
                        cancelAction={confirmCancel}
                    />
                </ScrollView>
            </FormProvider>
        </View>
    );
}

export default StoreInfoForm;
