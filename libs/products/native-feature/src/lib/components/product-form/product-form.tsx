
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
    ProductEntity,
    ProductService,
} from '@pos/categories/data-access';
import { RootState } from '@pos/store';
import { Product } from '@pos/shared/models';

export interface ProductFormParams {
    [name: string]: object | undefined;
    product: Product;
}

export interface ProductFormProps {
    navigation: NativeStackNavigationProp< ProductFormParams>;
}

export function ProductForm({ navigation }: ProductFormProps) {
    const product = useSelector((state: RootState) => state.products.selected);
    const dispatch = useDispatch();
    const styles = useSharedStyles();
    const [busy, setBusy] = useState<boolean>(false);

    const save = async () => {
        setBusy(true);
        const formValues: ProductEntity = form.getValues();
        
        if (!formValues.id) {
            delete formValues.id;
        }

        await ProductService.save(dispatch, formValues);
        navigation.goBack();
        setBusy(false);
    };

    const form = useForm< Product >({
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

export default ProductForm;
