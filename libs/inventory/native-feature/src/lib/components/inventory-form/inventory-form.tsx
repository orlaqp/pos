
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
    InventoryEntity,
    InventoryService,
} from '@pos/inventory/data-access';
import { RootState } from '@pos/store';
import { Inventory } from '@pos/shared/models';

export interface InventoryFormParams {
    [name: string]: object | undefined;
    inventory: Inventory;
}

export interface InventoryFormProps {
    navigation: NativeStackNavigationProp< InventoryFormParams>;
}

export function InventoryForm({ navigation }: InventoryFormProps) {
    const inventory = useSelector((state: RootState) => state.inventories.selected);
    const dispatch = useDispatch();
    const styles = useSharedStyles();
    const [busy, setBusy] = useState<boolean>(false);

    const save = async () => {
        setBusy(true);
        const formValues: InventoryEntity = form.getValues();
        
        if (!formValues.id) {
            delete formValues.id;
        }

        await InventoryService.save(dispatch, formValues);
        navigation.goBack();
        setBusy(false);
    };

    const form = useForm< InventoryEntity >({
        mode: 'onChange',
        defaultValues: {
            id: inventory?.id,
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

export default InventoryForm;
