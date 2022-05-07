import React, { useState } from 'react';
import { useTheme } from '@rneui/themed';
import { View, StyleSheet } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import {
    UIActions,
    UiFileUpload,
    UIInput,
    UIVerticalSpacer,
} from '@pos/shared/ui-native';
import { FormProvider, useForm } from 'react-hook-form';
import { Category } from '@pos/models';

/* eslint-disable-next-line */
export interface CategoryFormProps {}

export function CategoryForm(props: CategoryFormProps) {
    const [picturePath, setPicturePath] = useState();

    const formMethods = useForm<Category>({
        mode: 'onChange',
        defaultValues: {
            name: '',
            description: '',
            color: '',
            // picture: ''
        },
    });

    return (
        <FormProvider {...formMethods}>
            <View style={{ width: '75%', flexDirection: 'column' }}>
                <UiFileUpload fileKey='categories/EBE3E047-F2E4-47BE-9C0A-83BD271F1703.png' />
                <UIVerticalSpacer size="large" />
                <UIInput
                    name="name"
                    placeholder="Name"
                    rules={{ required: 'Name is required' }}
                />
                <UIInput
                    name="description"
                    placeholder="Description"
                    multiline={true}
                    numberOfLines={3}
                    style={{ height: 100, textAlignVertical: 'top' }}
                />
                <UIVerticalSpacer size='small' />
                <UIActions
                    submitAction={() => alert('saving')}
                    cancelAction={() => alert('cancel')}
                />
            </View>
        </FormProvider>
    );
}

export default CategoryForm;
