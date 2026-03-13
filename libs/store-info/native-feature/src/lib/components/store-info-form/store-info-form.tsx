import { UIActions, UICard, UIInput, UIScreen, UIStack } from '@pos/shared/ui-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { fetchStoreInfo, selectStore, StoreInfoEntity, StoreInfoService } from '@pos/store-info/data-access';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { View, Text, Alert, ScrollView, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

/* eslint-disable-next-line */
export interface StoreInfoFormProps {
    navigation: NativeStackNavigationProp<any>;
}

export function StoreInfoForm({ navigation }: StoreInfoFormProps) {
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const storeInfo = useSelector(selectStore);
    const dispatch = useDispatch();
    const [busy, setBusy] = useState<boolean>(false);

    const save = async () => {
        setBusy(true);
        const formValues: StoreInfoEntity = form.getValues();
        
        if (!formValues.id) {
            delete formValues.id;
        }

        await StoreInfoService.save(dispatch, formValues);
        // navigation.goBack();
        Alert.alert('Store information has been updated');
        setBusy(false);
    };

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

    const form = useForm< StoreInfoEntity >({
        mode: 'onChange',
        defaultValues: {
            id: storeInfo?.id,
            name: storeInfo?.name,
            address: storeInfo?.address,
            city: storeInfo?.city,
            state: storeInfo?.state,
            zipCode: storeInfo?.zipCode,
            country: 'USA',
            email: storeInfo?.email,
            phone: storeInfo?.phone,
            fax: storeInfo?.fax,
            disclaimer: storeInfo?.disclaimer,
        },
    });

    useEffect(() => {
        dispatch(fetchStoreInfo());
    }, [dispatch]);
    
    return (
        <UIScreen padded>
            <FormProvider {...form}>
                <View style={styles.screen}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.container}>
                            <UIStack spacing="lg">
                                <UICard tone="muted" radius="lg">
                                    <Text style={styles.title}>Store Profile</Text>
                                    <Text style={styles.subtitle}>
                                        Manage store identity and contact details used across receipts and reports.
                                    </Text>
                                </UICard>

                                <UICard>
                                    <UIStack spacing="lg">
                                        <Text style={styles.sectionTitle}>Business Details</Text>
                                        <View style={styles.twoColumnRow}>
                                            <View style={styles.column}>
                                                <UIInput name="name" label="Name" placeholder="Name" rules={{ required: true }} />
                                            </View>
                                            <View style={styles.columnSpaced}>
                                                <UIInput name="email" label="Email" placeholder="Email" rules={{ required: true }} />
                                            </View>
                                        </View>
                                        <UIInput name="address" label="Address" placeholder="Address" rules={{ required: true }} />
                                        <View style={styles.twoColumnRow}>
                                            <View style={styles.column}>
                                                <UIInput name="city" label="City" placeholder="City" rules={{ required: true }} />
                                            </View>
                                            <View style={styles.columnSpaced}>
                                                <UIInput name="state" label="State" placeholder="State" rules={{ required: true }} />
                                            </View>
                                        </View>
                                        <View style={styles.threeColumnRow}>
                                            <View style={styles.column}>
                                                <UIInput name="zipCode" label="Zip Code" placeholder="Zip Code" rules={{ required: true }} />
                                            </View>
                                            <View style={styles.columnSpaced}>
                                                <UIInput name="phone" label="Phone" placeholder="Phone" rules={{ required: true }} />
                                            </View>
                                            <View style={styles.columnSpaced}>
                                                <UIInput name="fax" label="Fax" placeholder="Fax" rules={{ required: true }} />
                                            </View>
                                        </View>
                                    </UIStack>
                                </UICard>

                                <UICard tone="muted">
                                    <UIStack spacing="md">
                                        <Text style={styles.sectionTitle}>Receipt Footer</Text>
                                        <UIInput
                                            name="disclaimer"
                                            label="Disclaimer"
                                            placeholder="Disclaimer"
                                            multiline={true}
                                            numberOfLines={3}
                                            style={styles.disclaimerInput}
                                        />
                                    </UIStack>
                                </UICard>

                                <UIActions
                                    busy={busy}
                                    submitAction={form.handleSubmit(save)}
                                    cancelAction={confirmCancel}
                                />
                            </UIStack>
                        </View>
                    </ScrollView>
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
            paddingVertical: tokens.spacing.lg,
            paddingBottom: tokens.spacing.xl,
            alignItems: 'center',
        },
        container: {
            width: '100%',
            maxWidth: 1240,
        },
        title: {
            color: tokens.colors.textPrimary,
            fontSize: 28,
            fontWeight: '700',
        },
        subtitle: {
            color: tokens.colors.textSecondary,
            marginTop: tokens.spacing.xs,
            fontSize: 15,
            lineHeight: 21,
        },
        sectionTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 19,
            fontWeight: '700',
        },
        twoColumnRow: {
            flexDirection: 'row',
        },
        threeColumnRow: {
            flexDirection: 'row',
        },
        column: {
            flex: 1,
        },
        columnSpaced: {
            flex: 1,
            marginLeft: tokens.spacing.md,
        },
        disclaimerInput: {
            minHeight: 96,
            textAlignVertical: 'top',
        },
    });

export default StoreInfoForm;
