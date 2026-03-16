import React, { useState } from 'react';

import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
    UIActions,
    UICard,
    UiFileUpload,
    UIInput,
    UIScreen,
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
import { useDesignTokens } from '@pos/theme/native/design-tokens';

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
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const [busy, setBusy] = useState<boolean>(false);

    const updatePicture = (key: string) => {
        form.setValue('picture', key);
    };

    const save = async () => {
        setBusy(true);
        try {
            const cat: CategoryEntity = form.getValues();

            if (!cat.id) {
                delete cat.id;
            }

            await CategoryService.save(dispatch, cat);
            navigation.goBack();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            console.error('Unable to save category', error);
            Alert.alert(
                'Unable to save category',
                message || 'The category could not be saved.'
            );
        } finally {
            setBusy(false);
        }
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
        <UIScreen>
            <FormProvider {...form}>
                <View style={styles.screen}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.container}>
                            <UICard tone="muted" radius="lg" style={styles.headerCard}>
                                <Text style={styles.headerTitle}>Category Profile</Text>
                                <Text style={styles.headerSubtitle}>
                                    Define a category with image and metadata.
                                </Text>
                            </UICard>

                            <UICard style={styles.sectionCard}>
                                <Text style={styles.sectionTitle}>Catalog</Text>
                                <View style={styles.uploadWrap}>
                                    <UiFileUpload
                                        prefix="categories"
                                        imageKey={form.getValues().picture}
                                        onAssetUploaded={updatePicture}
                                        onAssetRemoved={updatePicture}
                                    />
                                </View>
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
                                    multiline
                                    numberOfLines={3}
                                    style={styles.descriptionInput}
                                />
                            </UICard>
                        </View>
                    </ScrollView>
                    <View style={styles.actionBar}>
                        <UICard tone="muted" style={styles.actionBarCard}>
                            <UIActions
                                busy={busy}
                                submitAction={form.handleSubmit(save)}
                                cancelAction={confirmCancel}
                            />
                        </UICard>
                    </View>
                </View>
            </FormProvider>
        </UIScreen>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        screen: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: tokens.spacing.xl,
            paddingTop: tokens.spacing.lg,
            paddingBottom: tokens.spacing.xl,
            alignItems: 'center',
        },
        container: {
            width: '100%',
            maxWidth: 980,
        },
        headerCard: {
            marginBottom: tokens.spacing.lg,
        },
        headerTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 26,
            fontWeight: '700',
        },
        headerSubtitle: {
            color: tokens.colors.textSecondary,
            marginTop: tokens.spacing.xs,
            fontSize: 15,
        },
        sectionCard: {
            marginBottom: tokens.spacing.lg,
        },
        sectionTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 19,
            fontWeight: '700',
            marginBottom: tokens.spacing.sm,
        },
        uploadWrap: {
            marginBottom: tokens.spacing.sm,
            paddingTop: tokens.spacing.xs,
        },
        descriptionInput: {
            height: 100,
            textAlignVertical: 'top',
        },
        actionBar: {
            paddingHorizontal: tokens.spacing.xl,
            paddingBottom: tokens.spacing.md,
            paddingTop: tokens.spacing.xs,
        },
        actionBarCard: {
            maxWidth: 980,
            alignSelf: 'center',
            width: '100%',
            borderRadius: tokens.radii.lg,
        },
    });

export default CategoryForm;
