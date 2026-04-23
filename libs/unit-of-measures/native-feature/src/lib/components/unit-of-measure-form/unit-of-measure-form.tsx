
import React, { useState } from 'react';

import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { UIActions, UICard, UIInput, UIScreen } from '@pos/shared/ui-native';
import { FormProvider, useForm } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import {
    UnitOfMeasureEntity,
    UnitOfMeasureService,
} from '@pos/unit-of-measures/data-access';
import { RootState } from '@pos/store';
import { UnitOfMeasure } from '@pos/shared/models';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

export interface UnitOfMeasureFormParams {
    [name: string]: object | undefined;
    unitOfMeasure: UnitOfMeasure;
}

export interface UnitOfMeasureFormProps {
    navigation: NativeStackNavigationProp< UnitOfMeasureFormParams>;
}

export function UnitOfMeasureForm({ navigation }: UnitOfMeasureFormProps) {
    const unitOfMeasure = useSelector((state: RootState) => state.unitOfMeasures.selected);
    const dispatch = useDispatch();
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const [busy, setBusy] = useState<boolean>(false);

    const save = async () => {
        setBusy(true);
        const formValues: UnitOfMeasureEntity = form.getValues();
        
        if (!formValues.id) {
            delete formValues.id;
        }

        await UnitOfMeasureService.save(dispatch, formValues);
        navigation.goBack();
        setBusy(false);
    };

    const form = useForm< UnitOfMeasureEntity >({
        mode: 'onChange',
        defaultValues: {
            id: unitOfMeasure?.id,
            name: unitOfMeasure?.name,
            description: unitOfMeasure?.description
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
        <UIScreen>
            <FormProvider {...form}>
                <View style={styles.screen}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.container}>
                            <UICard tone="muted" radius="lg" style={styles.headerCard}>
                                <Text style={styles.headerTitle}>Unit of Measure Profile</Text>
                                <Text style={styles.headerSubtitle}>
                                    Define shorthand units used across products and inventory.
                                </Text>
                            </UICard>

                            <UICard style={styles.sectionCard}>
                                <Text style={styles.sectionTitle}>Details</Text>
                                <UIInput name="name" placeholder="Name" label="Name" />
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

export default UnitOfMeasureForm;
