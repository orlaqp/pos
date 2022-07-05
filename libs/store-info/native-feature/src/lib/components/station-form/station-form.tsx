import { UIActions, UIInput } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { fetchStoreInfo, selectStore, StoreInfoEntity, StoreInfoService } from '@pos/store-info/data-access';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { View, Text, Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchStationInfo, saveStationNumber, selectStation, StationConfig, StationService } from '@pos/settings/data-access';

/* eslint-disable-next-line */
export interface StationFormProps {
    navigation: NativeStackNavigationProp<any>;
}

export type CustomStationConfig = Omit<StationConfig, 'orderNumber'> & { orderNumber: string };

export function StationForm({ navigation }: StationFormProps) {
    const styles = useSharedStyles();
    const dispatch = useDispatch();
    const stationInfo = useSelector(selectStation);
    const [busy, setBusy] = useState<boolean>(false);
    
    const save = async () => {
        setBusy(true);
        const formValues: CustomStationConfig = form.getValues();

        if (!formValues.stationNumber) return;

        dispatch(saveStationNumber(formValues.stationNumber));
        
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

    console.log(stationInfo);

    const form = useForm< CustomStationConfig >({
        mode: 'onChange',
        defaultValues: {
            currentDate: stationInfo?.currentDate,
            orderNumber: stationInfo?.orderNumber?.toString().padStart(5, '0'),
            stationNumber: stationInfo?.stationNumber
        },
    });

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
                    <UIInput name="currentDate" label="Current Date (read only)" placeholder="Current Date" disabled={true} />
                    <UIInput name="orderNumber" label="Order Number (read only)" placeholder="Order Number" disabled={true} />
                    <UIInput name="stationNumber" label="Station Number" placeholder="Station Number" rules={{ required: true }} />
                    
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

export default StationForm;
