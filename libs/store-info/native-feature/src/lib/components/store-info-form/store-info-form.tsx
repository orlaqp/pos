import { UIActions, UICard, UIInput, UIScreen, UIStack } from '@pos/shared/ui-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { fetchStoreInfo, selectStore, StoreInfoEntity, StoreInfoService } from '@pos/store-info/data-access';
import React, { useEffect, useState } from 'react';
import { FieldErrors, FormProvider, useForm } from 'react-hook-form';

import { View, Text, Alert, ScrollView, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch } from '@pos/store';
import { translateWithFallback } from '@pos/shared/utils';

/* eslint-disable-next-line */
export interface StoreInfoFormProps {
    navigation: NativeStackNavigationProp<any>;
}

export function StoreInfoForm({ navigation }: StoreInfoFormProps) {
    const t = translateWithFallback;
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const storeInfo = useSelector(selectStore);
    const dispatch = useAppDispatch();
    const [busy, setBusy] = useState<boolean>(false);
    const defaultFormValues = {
        id: storeInfo?.id,
        name: storeInfo?.name || '',
        address: storeInfo?.address || '',
        city: storeInfo?.city || '',
        state: storeInfo?.state || '',
        zipCode: storeInfo?.zipCode || '',
        country: storeInfo?.country || 'USA',
        email: storeInfo?.email || '',
        phone: storeInfo?.phone || '',
        fax: storeInfo?.fax || '',
        disclaimer: storeInfo?.disclaimer || '',
        timezone: storeInfo?.timezone || 'America/New_York',
    };

    const save = async () => {
        setBusy(true);
        try {
            const formValues: StoreInfoEntity = form.getValues();
            
            if (!formValues.id) {
                delete formValues.id;
            }

            await StoreInfoService.save(dispatch, formValues);
            Alert.alert(
                t('STOREINFO_SaveSuccess', 'Store information has been updated')
            );
        } catch (error) {
            Alert.alert(
                t('STOREINFO_SaveErrorTitle', 'Unable to save store information'),
                error instanceof Error
                    ? error.message
                    : t('COMMON_TryAgainMoment', 'Please try again in a moment.')
            );
        } finally {
            setBusy(false);
        }
    };

    const onInvalid = (errors: FieldErrors<StoreInfoEntity>) => {
        const firstInvalidField = Object.keys(errors)[0];
        const labelByField: Partial<Record<keyof StoreInfoEntity, string>> = {
            name: t('COMMON_Name', 'Name'),
            email: t('COMMON_Email', 'Email'),
            address: t('COMMON_Address', 'Address'),
            city: t('COMMON_City', 'City'),
            state: t('COMMON_State', 'State'),
            zipCode: t('COMMON_ZipCode', 'Zip Code'),
            phone: t('COMMON_Phone', 'Phone'),
        };

        Alert.alert(
            t('COMMON_MissingInformation', 'Missing information'),
            firstInvalidField
                ? t(
                      'COMMON_FieldRequired',
                      '{{field}} is required.',
                      {
                          field:
                              labelByField[firstInvalidField as keyof StoreInfoEntity] ||
                              firstInvalidField,
                      }
                  )
                : t(
                      'STOREINFO_CompleteRequiredFields',
                      'Please complete all required fields before saving.'
                  )
        );
    };

    const confirmCancel = () => {
        Alert.alert(
            t('COMMON_AreYouSure', 'Are you sure?'),
            t('COMMON_UndoOperationWarning', 'You will not be able to undo this operation'),
            [
                { text: t('COMMON_No', 'No') },
                { text: t('COMMON_Yes', 'Yes'), onPress: () => navigation.goBack() },
            ]
        );
    }

    const form = useForm< StoreInfoEntity >({
        mode: 'onChange',
        defaultValues: defaultFormValues,
    });

    useEffect(() => {
        dispatch(fetchStoreInfo());
    }, [dispatch]);

    useEffect(() => {
        form.reset(defaultFormValues);
    }, [form, storeInfo]);
    
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
                                    <Text style={styles.title}>
                                        {t('STOREINFO_ProfileTitle', 'Store Profile')}
                                    </Text>
                                    <Text style={styles.subtitle}>
                                        {t(
                                            'STOREINFO_ProfileSubtitle',
                                            'Manage store identity and contact details used across receipts and reports.'
                                        )}
                                    </Text>
                                </UICard>

                                <UICard>
                                    <UIStack spacing="lg">
                                        <Text style={styles.sectionTitle}>
                                            {t('STOREINFO_BusinessDetails', 'Business Details')}
                                        </Text>
                                        <View style={styles.twoColumnRow}>
                                            <View style={styles.column}>
                                                <UIInput
                                                    name="name"
                                                    label={t('COMMON_Name', 'Name')}
                                                    placeholder={t('COMMON_Name', 'Name')}
                                                    rules={{ required: t('COMMON_NameRequired', 'Name is required') }}
                                                />
                                            </View>
                                            <View style={styles.columnSpaced}>
                                                <UIInput
                                                    name="email"
                                                    label={t('COMMON_Email', 'Email')}
                                                    placeholder={t('COMMON_Email', 'Email')}
                                                    rules={{ required: t('COMMON_EmailRequired', 'Email is required') }}
                                                />
                                            </View>
                                        </View>
                                        <UIInput
                                            name="address"
                                            label={t('COMMON_Address', 'Address')}
                                            placeholder={t('COMMON_Address', 'Address')}
                                            rules={{ required: t('COMMON_AddressRequired', 'Address is required') }}
                                        />
                                        <View style={styles.twoColumnRow}>
                                            <View style={styles.column}>
                                                <UIInput
                                                    name="city"
                                                    label={t('COMMON_City', 'City')}
                                                    placeholder={t('COMMON_City', 'City')}
                                                    rules={{ required: t('COMMON_CityRequired', 'City is required') }}
                                                />
                                            </View>
                                            <View style={styles.columnSpaced}>
                                                <UIInput
                                                    name="state"
                                                    label={t('COMMON_State', 'State')}
                                                    placeholder={t('COMMON_State', 'State')}
                                                    rules={{ required: t('COMMON_StateRequired', 'State is required') }}
                                                />
                                            </View>
                                        </View>
                                        <View style={styles.threeColumnRow}>
                                            <View style={styles.column}>
                                                <UIInput
                                                    name="zipCode"
                                                    label={t('COMMON_ZipCode', 'Zip Code')}
                                                    placeholder={t('COMMON_ZipCode', 'Zip Code')}
                                                    rules={{ required: t('COMMON_ZipCodeRequired', 'Zip Code is required') }}
                                                />
                                            </View>
                                            <View style={styles.columnSpaced}>
                                                <UIInput
                                                    name="phone"
                                                    label={t('COMMON_Phone', 'Phone')}
                                                    placeholder={t('COMMON_Phone', 'Phone')}
                                                    rules={{ required: t('COMMON_PhoneRequired', 'Phone is required') }}
                                                />
                                            </View>
                                            <View style={styles.columnSpaced}>
                                                <UIInput
                                                    name="fax"
                                                    label={t('COMMON_Fax', 'Fax')}
                                                    placeholder={t('COMMON_Fax', 'Fax')}
                                                />
                                            </View>
                                        </View>
                                    </UIStack>
                                </UICard>

                                <UICard tone="muted">
                                    <UIStack spacing="md">
                                        <Text style={styles.sectionTitle}>
                                            {t('STOREINFO_ReceiptFooter', 'Receipt Footer')}
                                        </Text>
                                        <UIInput
                                            name="disclaimer"
                                            label={t('STOREINFO_Disclaimer', 'Disclaimer')}
                                            placeholder={t('STOREINFO_Disclaimer', 'Disclaimer')}
                                            multiline={true}
                                            numberOfLines={3}
                                            style={styles.disclaimerInput}
                                        />
                                    </UIStack>
                                </UICard>

                                <UIActions
                                    busy={busy}
                                    submitTestID="store-info-save"
                                    cancelTestID="store-info-cancel"
                                    submitAction={form.handleSubmit(save, onInvalid)}
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
