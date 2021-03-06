
import React, { useState } from 'react';

import { Alert, View } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { UIActions, UIInput } from '@pos/shared/ui-native';
import { FormProvider, useForm } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import {
    UnitOfMeasureEntity,
    UnitOfMeasureService,
} from '@pos/unit-of-measures/data-access';
import { RootState } from '@pos/store';
import { UnitOfMeasure } from '@pos/shared/models';

export interface UnitOfMeasureFormParams {
    [name: string]: object | undefined;
    unitOfMeasure: UnitOfMeasure;
}

export interface UnitOfMeasureFormProps {
    navigation: NativeStackNavigationProp< UnitOfMeasureFormParams>;
}

export function UnitOfMeasureForm({ navigation }: UnitOfMeasureFormProps) {
    const unitOfMeasure = useSelector((state: RootState) => state.unitOfMeasures.selected);
    const dispatch = useDispatch();
    const styles = useSharedStyles();
    const [busy, setBusy] = useState<boolean>(false);

    const save = async () => {
        setBusy(true);
        const formValues: UnitOfMeasureEntity = form.getValues();
        
        if (!formValues.id) {
            delete formValues.id;
        }

        await UnitOfMeasureService.save(dispatch, formValues);
        navigation.goBack();
        setBusy(false);
    };

    const form = useForm< UnitOfMeasureEntity >({
        mode: 'onChange',
        defaultValues: {
            id: unitOfMeasure?.id,
            name: unitOfMeasure?.name,
            description: unitOfMeasure?.description
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
                    <UIInput
                        name="description"
                        placeholder="Description"
                        multiline={true}
                        numberOfLines={3}
                        style={{ height: 100, textAlignVertical: 'top' }}
                    />
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

export default UnitOfMeasureForm;
