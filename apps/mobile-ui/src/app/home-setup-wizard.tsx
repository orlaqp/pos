import React from 'react';
import { Animated, Image, ImageSourcePropType, View } from 'react-native';
import { Button, Input, Text } from '@rneui/themed';
import { Controller, FormProvider, UseFormReturn } from 'react-hook-form';
import { UIAlert, UIInput } from '@pos/shared/ui-native';
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

    return (
        <View style={styles.shell}>
            <View style={styles.hero}>
                <Image source={brandMark} style={styles.brandMark} resizeMode="contain" />
                <Text style={styles.businessLabel}>{businessName || 'Business workspace'}</Text>
                <Text style={styles.heroTitle}>
                    {isEmployeeStep ? 'Finish owner setup' : 'Add store details'}
                </Text>
                <Text style={styles.heroSubtitle}>
                    {isEmployeeStep
                        ? 'Create the initial owner employee and PIN before shared-device access begins.'
                        : 'Finish the business setup with the primary store information used across receipts, settings, and reporting.'}
                </Text>
                <View style={styles.setupHeroMetaRow}>
                    <View style={styles.setupHeroMetaCard}>
                        <Text style={styles.setupHeroMetaLabel}>Current step</Text>
                        <Text style={styles.setupHeroMetaValue}>
                            {isEmployeeStep ? 'Owner employee' : 'Store details'}
                        </Text>
                    </View>
                    <View style={styles.setupHeroMetaCard}>
                        <Text style={styles.setupHeroMetaLabel}>Progress</Text>
                        <Text style={styles.setupHeroMetaValue}>
                            {isEmployeeStep ? 'Step 1 of 2' : 'Step 2 of 2'}
                        </Text>
                    </View>
                </View>
                <View style={styles.wizardStepsPanel}>
                    <Text style={styles.wizardStepsEyebrow}>Setup path</Text>
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
                            <Text style={styles.wizardStepTitle}>Owner employee</Text>
                            <Text style={styles.wizardStepText}>
                                Create the first employee profile and secure it with a PIN.
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
                            <Text style={styles.wizardStepTitle}>Store details</Text>
                            <Text style={styles.wizardStepText}>
                                Save the receipt and reporting details for the primary location.
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
                        {isEmployeeStep ? 'Owner setup' : 'Store setup'}
                    </Text>
                    <Text style={styles.keypadTitle}>
                        {isEmployeeStep ? 'Create owner employee' : 'Store details'}
                    </Text>
                    <Text style={styles.keypadHint}>
                        {isEmployeeStep
                            ? 'This one-time setup creates the first PIN-based employee for the tenant.'
                            : 'These values replace the default placeholders created during bootstrap.'}
                    </Text>
                </View>
                {setupError ? <UIAlert message={setupError} type="error" /> : null}
                {isEmployeeStep ? (
                    <FormProvider {...setupForm}>
                        <View style={styles.setupWizardContent}>
                            <View style={styles.setupSectionCard}>
                                <Text style={styles.setupSectionEyebrow}>
                                    Employee details
                                </Text>
                                <Text style={styles.setupSectionTitle}>
                                    Primary owner profile
                                </Text>
                                <Text style={styles.setupSectionHint}>
                                    This profile becomes the first PIN-based employee for the
                                    business.
                                </Text>
                                <UIInput
                                    name="name"
                                    placeholder="Owner display name"
                                    textAlign="left"
                                    rules={{ required: 'Owner display name is required' }}
                                />
                                <UIInput
                                    name="phone"
                                    placeholder="Owner phone"
                                    textAlign="left"
                                    keyboardType="default"
                                    autoCorrect={false}
                                />
                            </View>
                            <View style={styles.setupSectionCard}>
                                <Text style={styles.setupSectionEyebrow}>Access PIN</Text>
                                <Text style={styles.setupSectionTitle}>
                                    Shared-device access
                                </Text>
                                <Text style={styles.setupSectionHint}>
                                    Choose a secure 4-digit PIN used to unlock the workspace on
                                    this device.
                                </Text>
                                <View style={styles.formRow}>
                                    <View style={styles.formColumn}>
                                        <UIInput
                                            name="pin"
                                            placeholder="4-digit PIN"
                                            textAlign="left"
                                            keyboardType="number-pad"
                                            secureTextEntry={true}
                                            rules={{ required: 'PIN is required' }}
                                        />
                                    </View>
                                    <View style={styles.formColumn}>
                                        <UIInput
                                            name="confirmPin"
                                            placeholder="Confirm 4-digit PIN"
                                            textAlign="left"
                                            keyboardType="number-pad"
                                            secureTextEntry={true}
                                            rules={{ required: 'PIN confirmation is required' }}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={styles.setupActionRow}>
                                <Button
                                    title="Continue"
                                    buttonStyle={styles.setupButton}
                                    containerStyle={styles.setupPrimaryAction}
                                    loading={setupSaving}
                                    onPress={setupForm.handleSubmit(onCreateOwnerEmployee)}
                                />
                                {onLogoff ? (
                                    <Button
                                        title="Log off business"
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
                                <Text style={styles.setupSectionEyebrow}>Store identity</Text>
                                <Text style={styles.setupSectionTitle}>
                                    Primary location details
                                </Text>
                                <Text style={styles.setupSectionHint}>
                                    These details appear across receipts, settings, and reporting.
                                </Text>
                                <View style={styles.formRow}>
                                    <View style={styles.formColumn}>
                                        <UIInput
                                            name="name"
                                            placeholder="Store name"
                                            textAlign="left"
                                            rules={{ required: 'Store name is required' }}
                                        />
                                    </View>
                                    <View style={styles.formColumn}>
                                        <UIInput
                                            name="phone"
                                            placeholder="Store phone"
                                            textAlign="left"
                                            keyboardType="default"
                                            autoCorrect={false}
                                            rules={{ required: 'Store phone is required' }}
                                        />
                                    </View>
                                </View>
                                <View style={styles.formRow}>
                                    <View style={styles.formColumn}>
                                        <UIInput
                                            name="email"
                                            placeholder="Store email"
                                            textAlign="left"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            rules={{ required: 'Store email is required' }}
                                        />
                                    </View>
                                    <View style={styles.formColumn}>
                                        <UIInput
                                            name="country"
                                            placeholder="Country"
                                            textAlign="left"
                                            autoCapitalize="characters"
                                            rules={{ required: 'Country is required' }}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={styles.setupSectionCard}>
                                <Text style={styles.setupSectionEyebrow}>Address</Text>
                                <Text style={styles.setupSectionTitle}>
                                    Receipt and reporting location
                                </Text>
                                <Text style={styles.setupSectionHint}>
                                    Keep this address aligned with the store location customers see
                                    on printed receipts.
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
                                            placeholder="Street address"
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
                                            placeholder="City"
                                            textAlign="left"
                                            rules={{ required: 'City is required' }}
                                        />
                                    </View>
                                    <View style={styles.formColumn}>
                                        <UIInput
                                            name="state"
                                            placeholder="State"
                                            textAlign="left"
                                            autoCapitalize="characters"
                                            rules={{ required: 'State is required' }}
                                        />
                                    </View>
                                </View>
                                <View style={styles.formRow}>
                                    <View style={styles.formColumn}>
                                        <UIInput
                                            name="zipCode"
                                            placeholder="ZIP code"
                                            textAlign="left"
                                            keyboardType="number-pad"
                                            rules={{ required: 'ZIP code is required' }}
                                        />
                                    </View>
                                    <View style={styles.formColumn}>
                                        <View style={styles.formSpacer} />
                                    </View>
                                </View>
                            </View>
                            <View style={styles.setupActionRow}>
                                <Button
                                    title="Finish setup"
                                    buttonStyle={styles.setupButton}
                                    containerStyle={styles.setupPrimaryAction}
                                    loading={setupSaving}
                                    onPress={storeSetupForm.handleSubmit(onSaveStoreDetails)}
                                />
                                {onLogoff ? (
                                    <Button
                                        title="Log off business"
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
