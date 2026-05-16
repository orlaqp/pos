import React from 'react';
import { Animated, Image, ImageSourcePropType, View } from 'react-native';
import { Button, Input, Text } from '@rneui/themed';
import { Controller, FormProvider, UseFormReturn } from 'react-hook-form';
import { UIAlert, UIInput } from '@pos/shared/ui-native';
import { translateWithFallback } from '@pos/shared/utils';
import { HomeScreenStyles } from './HomeScreen.styles';

type FirstEmployeeSetupModel = {
    name: string;
    phone: string;
    pin: string;
    confirmPin: string;
};

type StoreSetupModel = {
    name: string;
    phone: string;
    email: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
};

interface HomeSetupWizardProps {
    brandMark: ImageSourcePropType;
    businessName?: string;
    setupStep: 'employee' | 'store';
    needsInitialEmployee: boolean;
    setupContentOpacity: Animated.Value;
    setupContentTranslateY: Animated.Value;
    setupError: string | null;
    setupSaving: boolean;
    setupForm: UseFormReturn<FirstEmployeeSetupModel>;
    storeSetupForm: UseFormReturn<StoreSetupModel>;
    styles: HomeScreenStyles;
    onCreateOwnerEmployee: (model: FirstEmployeeSetupModel) => void;
    onSaveStoreDetails: (model: StoreSetupModel) => void;
    onLogoff?: () => void;
}

export function HomeSetupWizard({
    brandMark,
    businessName,
    setupStep,
    needsInitialEmployee,
    setupContentOpacity,
    setupContentTranslateY,
    setupError,
    setupSaving,
    setupForm,
    storeSetupForm,
    styles,
    onCreateOwnerEmployee,
    onSaveStoreDetails,
    onLogoff,
}: HomeSetupWizardProps) {
    const isEmployeeStep = setupStep === 'employee';
    const employeeStepComplete = !needsInitialEmployee;
    const t = translateWithFallback;

    return (
        <View style={styles.shell}>
            <View style={styles.hero}>
                <Image source={brandMark} style={styles.brandMark} resizeMode="contain" />
                <Text style={styles.businessLabel}>
                    {businessName || t('HOME_BusinessWorkspace', 'Business workspace')}
                </Text>
                <Text style={styles.heroTitle}>
                    {isEmployeeStep
                        ? t('HOME_FinishOwnerSetupTitle', 'Finish owner setup')
                        : t('HOME_AddStoreDetailsTitle', 'Add store details')}
                </Text>
                <Text style={styles.heroSubtitle}>
                    {isEmployeeStep
                        ? t(
                              'HOME_FinishOwnerSetupSubtitle',
                              'Create the initial owner employee and PIN before shared-device access begins.'
                          )
                        : t(
                              'HOME_AddStoreDetailsSubtitle',
                              'Finish the business setup with the primary store information used across receipts, settings, and reporting.'
                          )}
                </Text>
                <View style={styles.setupHeroMetaRow}>
                    <View style={styles.setupHeroMetaCard}>
                        <Text style={styles.setupHeroMetaLabel}>
                            {t('HOME_CurrentStepLabel', 'Current step')}
                        </Text>
                        <Text style={styles.setupHeroMetaValue}>
                            {isEmployeeStep
                                ? t('HOME_CurrentStepOwner', 'Owner employee')
                                : t('HOME_CurrentStepStore', 'Store details')}
                        </Text>
                    </View>
                    <View style={styles.setupHeroMetaCard}>
                        <Text style={styles.setupHeroMetaLabel}>
                            {t('HOME_SetupProgressLabel', 'Progress')}
                        </Text>
                        <Text style={styles.setupHeroMetaValue}>
                            {isEmployeeStep
                                ? t('HOME_SetupProgressStep1', 'Step 1 of 2')
                                : t('HOME_SetupProgressStep2', 'Step 2 of 2')}
                        </Text>
                    </View>
                </View>
                <View style={styles.wizardStepsPanel}>
                    <Text style={styles.wizardStepsEyebrow}>
                        {t('HOME_SetupPathEyebrow', 'Setup path')}
                    </Text>
                    <View
                        style={[
                            styles.wizardStepCard,
                            isEmployeeStep ? styles.wizardStepCardActive : undefined,
                            employeeStepComplete ? styles.wizardStepCardComplete : undefined,
                        ]}
                    >
                        <View
                            style={[
                                styles.wizardStepDot,
                                isEmployeeStep ? styles.wizardStepDotActive : undefined,
                                employeeStepComplete
                                    ? styles.wizardStepDotComplete
                                    : undefined,
                            ]}
                        />
                        <View style={styles.wizardStepCopy}>
                            <Text style={styles.wizardStepTitle}>
                                {t('HOME_WizardOwnerEmployeeTitle', 'Owner employee')}
                            </Text>
                            <Text style={styles.wizardStepText}>
                                {t(
                                    'HOME_WizardOwnerEmployeeText',
                                    'Create the first employee profile and secure it with a PIN.'
                                )}
                            </Text>
                        </View>
                    </View>
                    <View
                        style={[
                            styles.wizardStepCard,
                            !isEmployeeStep ? styles.wizardStepCardActive : undefined,
                        ]}
                    >
                        <View
                            style={[
                                styles.wizardStepDot,
                                !isEmployeeStep ? styles.wizardStepDotActive : undefined,
                            ]}
                        />
                        <View style={styles.wizardStepCopy}>
                            <Text style={styles.wizardStepTitle}>
                                {t('HOME_WizardStoreDetailsTitle', 'Store details')}
                            </Text>
                            <Text style={styles.wizardStepText}>
                                {t(
                                    'HOME_WizardStoreDetailsText',
                                    'Save the receipt and reporting details for the primary location.'
                                )}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
            <Animated.View
                style={[
                    styles.keypadCard,
                    isEmployeeStep ? styles.setupWizardCard : styles.wizardCardWide,
                    {
                        opacity: setupContentOpacity,
                        transform: [{ translateY: setupContentTranslateY }],
                    },
                ]}
            >
                <View style={styles.setupWizardHeader}>
                    <Text style={styles.setupWizardEyebrow}>
                        {isEmployeeStep
                            ? t('HOME_OwnerSetupEyebrow', 'Owner setup')
                            : t('HOME_StoreSetupEyebrow', 'Store setup')}
                    </Text>
                    <Text style={styles.keypadTitle}>
                        {isEmployeeStep
                            ? t('HOME_CreateOwnerEmployeeTitle', 'Create owner employee')
                            : t('HOME_StoreDetailsTitle', 'Store details')}
                    </Text>
                    <Text style={styles.keypadHint}>
                        {isEmployeeStep
                            ? t(
                                  'HOME_CreateOwnerEmployeeHint',
                                  'This one-time setup creates the first PIN-based employee for the tenant.'
                              )
                            : t(
                                  'HOME_StoreDetailsHint',
                                  'These values replace the default placeholders created during bootstrap.'
                              )}
                    </Text>
                </View>
                {setupError ? <UIAlert message={setupError} type="error" /> : null}
                {isEmployeeStep ? (
                    <FormProvider {...setupForm}>
                        <View style={styles.setupWizardContent}>
                            <View style={styles.setupSectionCard}>
                                <Text style={styles.setupSectionEyebrow}>
                                    {t('HOME_EmployeeDetailsEyebrow', 'Employee details')}
                                </Text>
                                <Text style={styles.setupSectionTitle}>
                                    {t('HOME_PrimaryOwnerProfileTitle', 'Primary owner profile')}
                                </Text>
                                <Text style={styles.setupSectionHint}>
                                    {t(
                                        'HOME_PrimaryOwnerProfileHint',
                                        'This profile becomes the first PIN-based employee for the business.'
                                    )}
                                </Text>
                                <UIInput
                                    name="name"
                                    placeholder={t(
                                        'HOME_OwnerDisplayNamePlaceholder',
                                        'Owner display name'
                                    )}
                                    textAlign="left"
                                    rules={{
                                        required: t(
                                            'HOME_OwnerDisplayNameRequired',
                                            'Owner display name is required'
                                        ),
                                    }}
                                />
                                <UIInput
                                    name="phone"
                                    placeholder={t(
                                        'HOME_OwnerPhonePlaceholder',
                                        'Owner phone'
                                    )}
                                    textAlign="left"
                                    keyboardType="default"
                                    autoCorrect={false}
                                />
                            </View>
                            <View style={styles.setupSectionCard}>
                                <Text style={styles.setupSectionEyebrow}>
                                    {t('HOME_AccessPinEyebrow', 'Access PIN')}
                                </Text>
                                <Text style={styles.setupSectionTitle}>
                                    {t(
                                        'HOME_SharedDeviceAccessTitle',
                                        'Shared-device access'
                                    )}
                                </Text>
                                <Text style={styles.setupSectionHint}>
                                    {t(
                                        'HOME_SharedDeviceAccessSetupHint',
                                        'Choose a secure 4-digit PIN used to unlock the workspace on this device.'
                                    )}
                                </Text>
                                <View style={styles.formRow}>
                                    <View style={styles.formColumn}>
                                        <UIInput
                                            name="pin"
                                            placeholder={t(
                                                'HOME_PinPlaceholder',
                                                '4-digit PIN'
                                            )}
                                            textAlign="left"
                                            keyboardType="number-pad"
                                            secureTextEntry={true}
                                            rules={{
                                                required: t(
                                                    'HOME_PinRequired',
                                                    'PIN is required'
                                                ),
                                            }}
                                        />
                                    </View>
                                    <View style={styles.formColumn}>
                                        <UIInput
                                            name="confirmPin"
                                            placeholder={t(
                                                'HOME_ConfirmPinPlaceholder',
                                                'Confirm 4-digit PIN'
                                            )}
                                            textAlign="left"
                                            keyboardType="number-pad"
                                            secureTextEntry={true}
                                            rules={{
                                                required: t(
                                                    'HOME_PinConfirmationRequired',
                                                    'PIN confirmation is required'
                                                ),
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={styles.setupActionRow}>
                                <Button
                                    title={t('COMMON_Continue', 'Continue')}
                                    buttonStyle={styles.setupButton}
                                    containerStyle={styles.setupPrimaryAction}
                                    loading={setupSaving}
                                    onPress={setupForm.handleSubmit(onCreateOwnerEmployee)}
                                />
                                {onLogoff ? (
                                    <Button
                                        title={t('HOME_LogoffBusinessButton', 'Log off business')}
                                        type="clear"
                                        buttonStyle={styles.setupSecondaryButton}
                                        titleStyle={styles.setupLogoffButtonText}
                                        onPress={onLogoff}
                                    />
                                ) : null}
                            </View>
                        </View>
                    </FormProvider>
                ) : (
                    <FormProvider {...storeSetupForm}>
                        <View style={styles.setupWizardContent}>
                            <View style={styles.setupSectionCard}>
                                <Text style={styles.setupSectionEyebrow}>
                                    {t('HOME_StoreIdentityEyebrow', 'Store identity')}
                                </Text>
                                <Text style={styles.setupSectionTitle}>
                                    {t(
                                        'HOME_PrimaryLocationDetailsTitle',
                                        'Primary location details'
                                    )}
                                </Text>
                                <Text style={styles.setupSectionHint}>
                                    {t(
                                        'HOME_PrimaryLocationDetailsHint',
                                        'These details appear across receipts, settings, and reporting.'
                                    )}
                                </Text>
                                <View style={styles.formRow}>
                                    <View style={styles.formColumn}>
                                        <UIInput
                                            name="name"
                                            placeholder={t(
                                                'HOME_StoreNamePlaceholder',
                                                'Store name'
                                            )}
                                            textAlign="left"
                                            rules={{
                                                required: t(
                                                    'HOME_StoreNameRequired',
                                                    'Store name is required'
                                                ),
                                            }}
                                        />
                                    </View>
                                    <View style={styles.formColumn}>
                                        <UIInput
                                            name="phone"
                                            placeholder={t(
                                                'HOME_StorePhonePlaceholder',
                                                'Store phone'
                                            )}
                                            textAlign="left"
                                            keyboardType="default"
                                            autoCorrect={false}
                                            rules={{
                                                required: t(
                                                    'HOME_StorePhoneRequired',
                                                    'Store phone is required'
                                                ),
                                            }}
                                        />
                                    </View>
                                </View>
                                <View style={styles.formRow}>
                                    <View style={styles.formColumn}>
                                        <UIInput
                                            name="email"
                                            placeholder={t(
                                                'HOME_StoreEmailPlaceholder',
                                                'Store email'
                                            )}
                                            textAlign="left"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            rules={{
                                                required: t(
                                                    'HOME_StoreEmailRequired',
                                                    'Store email is required'
                                                ),
                                            }}
                                        />
                                    </View>
                                    <View style={styles.formColumn}>
                                        <UIInput
                                            name="country"
                                            placeholder={t(
                                                'HOME_CountryPlaceholder',
                                                'Country'
                                            )}
                                            textAlign="left"
                                            autoCapitalize="characters"
                                            rules={{
                                                required: t(
                                                    'HOME_CountryRequired',
                                                    'Country is required'
                                                ),
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={styles.setupSectionCard}>
                                <Text style={styles.setupSectionEyebrow}>
                                    {t('HOME_AddressEyebrow', 'Address')}
                                </Text>
                                <Text style={styles.setupSectionTitle}>
                                    {t(
                                        'HOME_ReceiptLocationTitle',
                                        'Receipt and reporting location'
                                    )}
                                </Text>
                                <Text style={styles.setupSectionHint}>
                                    {t(
                                        'HOME_ReceiptLocationHint',
                                        'Keep this address aligned with the store location customers see on printed receipts.'
                                    )}
                                </Text>
                                <Controller
                                    control={storeSetupForm.control}
                                    name="streetAddress"
                                    defaultValue=""
                                    rules={{ required: 'Address is required' }}
                                    render={({
                                        field: { onChange, onBlur, value },
                                        fieldState: { error },
                                    }) => (
                                        <Input
                                            placeholder={t(
                                                'HOME_StreetAddressPlaceholder',
                                                'Street address'
                                            )}
                                            value={typeof value === 'string' ? value : ''}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            autoCorrect={false}
                                            autoCapitalize="words"
                                            errorMessage={error?.message}
                                            containerStyle={styles.fullWidthInputContainer}
                                            inputContainerStyle={styles.fullWidthInputField}
                                            inputStyle={styles.fullWidthInputText}
                                        />
                                    )}
                                />
                                <View style={styles.formRow}>
                                    <View style={styles.formColumn}>
                                        <UIInput
                                            name="city"
                                            placeholder={t('HOME_CityPlaceholder', 'City')}
                                            textAlign="left"
                                            rules={{
                                                required: t(
                                                    'HOME_CityRequired',
                                                    'City is required'
                                                ),
                                            }}
                                        />
                                    </View>
                                    <View style={styles.formColumn}>
                                        <UIInput
                                            name="state"
                                            placeholder={t('HOME_StatePlaceholder', 'State')}
                                            textAlign="left"
                                            autoCapitalize="characters"
                                            rules={{
                                                required: t(
                                                    'HOME_StateRequired',
                                                    'State is required'
                                                ),
                                            }}
                                        />
                                    </View>
                                </View>
                                <View style={styles.formRow}>
                                    <View style={styles.formColumn}>
                                        <UIInput
                                            name="zipCode"
                                            placeholder={t(
                                                'HOME_ZipCodePlaceholder',
                                                'ZIP code'
                                            )}
                                            textAlign="left"
                                            keyboardType="number-pad"
                                            rules={{
                                                required: t(
                                                    'HOME_ZipCodeRequired',
                                                    'ZIP code is required'
                                                ),
                                            }}
                                        />
                                    </View>
                                    <View style={styles.formColumn}>
                                        <View style={styles.formSpacer} />
                                    </View>
                                </View>
                            </View>
                            <View style={styles.setupActionRow}>
                                <Button
                                    title={t('HOME_FinishSetupButton', 'Finish setup')}
                                    buttonStyle={styles.setupButton}
                                    containerStyle={styles.setupPrimaryAction}
                                    loading={setupSaving}
                                    onPress={storeSetupForm.handleSubmit(onSaveStoreDetails)}
                                />
                                {onLogoff ? (
                                    <Button
                                        title={t('HOME_LogoffBusinessButton', 'Log off business')}
                                        type="clear"
                                        buttonStyle={styles.setupSecondaryButton}
                                        titleStyle={styles.setupLogoffButtonText}
                                        onPress={onLogoff}
                                    />
                                ) : null}
                            </View>
                        </View>
                    </FormProvider>
                )}
            </Animated.View>
        </View>
    );
}
