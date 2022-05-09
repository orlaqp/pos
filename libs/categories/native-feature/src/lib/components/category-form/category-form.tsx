import React, { useState } from 'react';
import { View } from 'react-native';
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
import { useDispatch, useSelector } from 'react-redux';
import {
    CategoryEntity,
    CategoryService,
} from '@pos/categories/data-access';
import { RootState } from '@pos/store';

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
                    <UIVerticalSpacer size="small" />
                    <UIActions
                        busy={busy}
                        submitAction={form.handleSubmit(save)}
                        cancelAction={() => alert('cancel')}
                    />
                </View>
            </FormProvider>
        </View>
    );
}

export default CategoryForm;
