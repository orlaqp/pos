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
    CategoryEntity,
    CategoryService,
} from '@pos/categories/data-access';
import { RootState } from '@pos/store';
import { Category } from '@pos/shared/models';

export interface CategoryFormParams {
    [name: string]: object | undefined;
    category: Category;
}

/* eslint-disable-next-line */
export interface CategoryFormProps {
    navigation: NativeStackNavigationProp<CategoryFormParams>;
}

export function CategoryForm({ navigation }: CategoryFormProps) {
    const category = useSelector((state: RootState) => state.categories.selected);
    const dispatch = useDispatch();
    const styles = useSharedStyles();
    const [busy, setBusy] = useState<boolean>(false);

    const updatePicture = (key: string) => {
        form.setValue('picture', key);
    };

    const save = async () => {
        setBusy(true);
        const cat: CategoryEntity = form.getValues();
        
        if (!cat.id) {
            delete cat.id;
        }

        await CategoryService.save(dispatch, cat);
        navigation.goBack();
        setBusy(false);
    };

    const form = useForm<Category>({
        mode: 'onChange',
        defaultValues: {
            id: category?.id,
            name: category?.name,
            description: category?.description,
            color: category?.color,
            picture: category?.picture,
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

    // TODO: Not sure if make this mandatory
    // form.control.register('picture', { required: true });
    form.control.register('id', { required: false });

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
                    <UiFileUpload
                        prefix='categories'
                        imageKey={form.getValues().picture}
                        onAssetUploaded={updatePicture}
                        onAssetRemoved={updatePicture}
                    />
                    <UIVerticalSpacer size="large" />
                    <UIInput
                        name="name"
                        label="Name"
                        placeholder="Name"
                        rules={{ required: 'Name is required' }}
                    />
                    <UIInput
                        name="description"
                        label="Description"
                        placeholder="Description"
                        multiline={true}
                        numberOfLines={3}
                        style={{ height: 100, textAlignVertical: 'top' }}
                    />
                    <UIVerticalSpacer size="small" />
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

export default CategoryForm;
