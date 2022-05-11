
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
    BrandEntity,
    BrandService,
} from '@pos/brands/data-access';
import { RootState } from '@pos/store';
import { Brand } from '@pos/shared/models';

export interface BrandFormParams {
    [name: string]: object | undefined;
    brand: Brand;
}

export interface BrandFormProps {
    navigation: NativeStackNavigationProp< BrandFormParams>;
}

export function BrandForm({ navigation }: BrandFormProps) {
    const brand = useSelector((state: RootState) => state.brands.selected);
    const dispatch = useDispatch();
    const styles = useSharedStyles();
    const [busy, setBusy] = useState<boolean>(false);

    const save = async () => {
        setBusy(true);
        const formValues: BrandEntity = form.getValues();
        
        if (!formValues.id) {
            delete formValues.id;
        }

        await BrandService.save(dispatch, formValues);
        navigation.goBack();
        setBusy(false);
    };

    const form = useForm< Brand >({
        mode: 'onChange',
        defaultValues: {
            // TODO: add defaults values to your form
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

export default BrandForm;
