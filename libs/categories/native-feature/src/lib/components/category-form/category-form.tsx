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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Route } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { add } from 'react-native-reanimated';
import { categoriesActions, CategoryService } from '@pos/categories/data-access';

export interface CategoryFormParams {
    [name: string]: object | undefined;
    category: Category;
}

/* eslint-disable-next-line */
export interface CategoryFormProps {
    navigation: NativeStackNavigationProp<CategoryFormParams>;
    route: Route<string, CategoryFormParams>;
}

export function CategoryForm({ navigation, route }: CategoryFormProps) {
    const category = route?.params.category;
    const dispatch = useDispatch();
    const [busy, setBusy] = useState<boolean>(false);

    const updatePicture = (key: string) => {
        form.setValue('picture', key);
    }

    const save = async () => {
        setBusy(true);
        if (!category?.id) {
            const values = form.getValues();
            const newCategory = await CategoryService.save(new Category({...values}));
            dispatch(categoriesActions.add(newCategory))
        }
        setBusy(false);
    }

    const form = useForm<Category>({
        mode: 'onChange',
        defaultValues: {
            name: category?.name,
            description: category?.description,
            color: category?.color,
            picture: category?.picture
        },
    });

    form.control.register('picture', { required: true });

    return (
        <FormProvider {...form}>
            <View style={{ width: '60%', flexDirection: 'column', marginTop: 50 }}>
                <UiFileUpload
                    imageKey={form.getValues().picture}
                    onAssetUploaded={updatePicture}
                    onAssetRemoved={updatePicture}
                />
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
                    busy={busy}
                    submitAction={form.handleSubmit(save)}
                    cancelAction={() => alert('cancel')}
                />
            </View>
        </FormProvider>
    );
}

export default CategoryForm;
