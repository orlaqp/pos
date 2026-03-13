import React, { useState } from 'react';

import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { UIActions, UICard, UIInput, UIScreen } from '@pos/shared/ui-native';
import { FormProvider, useForm } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { BrandEntity, BrandService } from '@pos/brands/data-access';
import { RootState } from '@pos/store';
import { Brand } from '@pos/shared/models';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

export interface BrandFormParams {
    [name: string]: object | undefined;
    brand: Brand;
}

export interface BrandFormProps {
    navigation: NativeStackNavigationProp<BrandFormParams>;
}

export function BrandForm({ navigation }: BrandFormProps) {
    const brand = useSelector((state: RootState) => state.brands.selected);
    const dispatch = useDispatch();
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
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

    const form = useForm<BrandEntity>({
        mode: 'onChange',
        defaultValues: {
            id: brand?.id,
            name: brand?.name,
            description: brand?.description,
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
        <UIScreen>
            <FormProvider {...form}>
                <View style={styles.screen}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.container}>
                            <UICard tone="muted" radius="lg" style={styles.headerCard}>
                                <Text style={styles.headerTitle}>Brand Profile</Text>
                                <Text style={styles.headerSubtitle}>
                                    Define brand identity and notes.
                                </Text>
                            </UICard>

                            <UICard style={styles.sectionCard}>
                                <Text style={styles.sectionTitle}>Details</Text>
                                <UIInput
                                    name="name"
                                    placeholder="Name"
                                    label="Name"
                                    rules={{ required: true }}
                                />
                                <UIInput
                                    name="description"
                                    placeholder="Description"
                                    label="Description"
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

export default BrandForm;
