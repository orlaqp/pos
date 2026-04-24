import React, { useState } from 'react';

import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { UIActions, UICard, UIInput, UIScreen } from '@pos/shared/ui-native';
import { FormProvider, useForm } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { BrandEntity, BrandService } from '@pos/brands/data-access';
import { RootState } from '@pos/store';
import { Brand } from '@pos/shared/models';
import { translateWithFallback } from '@pos/shared/utils';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

export interface BrandFormParams {
    [name: string]: object | undefined;
    brand: Brand;
}

export interface BrandFormProps {
    navigation: NativeStackNavigationProp<BrandFormParams>;
}

export function BrandForm({ navigation }: BrandFormProps) {
    const t = translateWithFallback;
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
            t('COMMON_AreYouSure', 'Are you sure?'),
            t(
                'COMMON_UndoOperationWarning',
                'You will not be able to undo this operation'
            ),
            [
                { text: t('COMMON_No', 'No') },
                { text: t('COMMON_Yes', 'Yes'), onPress: () => navigation.goBack() },
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
                                <Text style={styles.headerTitle}>
                                    {t('BRAND_ProfileTitle', 'Brand Profile')}
                                </Text>
                                <Text style={styles.headerSubtitle}>
                                    {t(
                                        'BRAND_ProfileSubtitle',
                                        'Define brand identity and notes.'
                                    )}
                                </Text>
                            </UICard>

                            <UICard style={styles.sectionCard}>
                                <Text style={styles.sectionTitle}>
                                    {t('COMMON_Details', 'Details')}
                                </Text>
                                <UIInput
                                    name="name"
                                    placeholder={t('COMMON_Name', 'Name')}
                                    label={t('COMMON_Name', 'Name')}
                                    rules={{ required: true }}
                                />
                                <UIInput
                                    name="description"
                                    placeholder={t('COMMON_Description', 'Description')}
                                    label={t('COMMON_Description', 'Description')}
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
            borderRadius: 26,
            borderColor: '#C7D0DB22',
            backgroundColor: '#080B10',
        },
        headerTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 28,
            fontWeight: '800',
            letterSpacing: -0.5,
        },
        headerSubtitle: {
            color: tokens.colors.textSecondary,
            marginTop: tokens.spacing.xs,
            fontSize: 15,
            lineHeight: 21,
        },
        sectionCard: {
            marginBottom: tokens.spacing.lg,
            borderRadius: 24,
            borderColor: '#C7D0DB22',
            backgroundColor: '#0E141C',
        },
        sectionTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 19,
            fontWeight: '800',
            letterSpacing: 0.2,
            marginBottom: tokens.spacing.md,
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
            borderRadius: 24,
            borderColor: '#C7D0DB22',
            backgroundColor: '#080B10',
        },
    });

export default BrandForm;
