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
    InventoryCountDTO,
    InventoryCountService,
} from '@pos/inventory/data-access';
import { RootState } from '@pos/store';
import { InventoryCount } from '@pos/shared/models';
import { Text } from '@rneui/themed';

export interface InventoryFormParams {
    [name: string]: object | undefined;
    inventory: InventoryCount;
}

export interface InventoryFormProps {
    navigation: NativeStackNavigationProp<InventoryFormParams>;
}

export function InventoryForm({ navigation }: InventoryFormProps) {
    const inventory = useSelector(
        (state: RootState) => state.inventoryCount.selected
    );
    const dispatch = useDispatch();
    const styles = useSharedStyles();
    const [busy, setBusy] = useState<boolean>(false);

    const save = async () => {
        setBusy(true);
        const formValues: InventoryCountDTO = form.getValues();

        if (!formValues.id) {
            delete formValues.id;
        }

        await InventoryCountService.save(dispatch, formValues);
        navigation.goBack();
        setBusy(false);
    };

    const form = useForm<InventoryCountDTO>({
        mode: 'onChange',
        defaultValues: {
            id: inventory?.id,
            comments: inventory?.comments,
            createdAt: new Date().toISOString()
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
    };

    return (
        <FormProvider {...form}>
            <View style={[styles.page]}>
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        marginTop: 50,
                    }}
                >
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.primaryText, { flex: 1 }]}>
                            { JSON.stringify(form.getValues()) }
                            {form?.getValues().createdAt && new Date(form.getValues().createdAt).toLocaleDateString()}
                        </Text>
                        <View style={{ flex: 2 }}>
                            <UIInput name="createdAt" placeholder="Created At" />
                            </View>
                        <View style={{ flex: 4 }}>
                            <UIInput name="comments" placeholder="Comments" />
                        </View>
                    </View>
                    <UIActions
                        busy={busy}
                        submitAction={form.handleSubmit(save)}
                        cancelAction={confirmCancel}
                    />
                </View>
            </View>
        </FormProvider>
    );
}

export default InventoryForm;
