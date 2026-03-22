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
}: HomeSetupWizardProps) {
    return (
        <View style={styles.shell}>
            <View style={styles.hero}>
                <Image source={brandMark} style={styles.brandMark} resizeMode="contain" />
                <Text style={styles.businessLabel}>{businessName || 'Business workspace'}</Text>
                <Text style={styles.heroTitle}>
                    {setupStep === 'employee' ? 'Finish owner setup' : 'Add store details'}
                </Text>
                <Text style={styles.heroSubtitle}>
                    {setupStep === 'employee'
                        ? 'Create the initial owner employee and PIN before shared-device access begins.'
                        : 'Finish the business setup with the primary store information used across receipts, settings, and reporting.'}
                </Text>
                <View style={styles.wizardSteps}>
                    <View style={styles.wizardStepRow}>
                        <View
                            style={[
                                styles.wizardStepDot,
                                setupStep === 'employee' ? styles.wizardStepDotActive : undefined,
                                !needsInitialEmployee ? styles.wizardStepDotComplete : undefined,
                            ]}
                        />
                        <Text style={styles.wizardStepText}>Owner employee</Text>
                    </View>
                    <View style={styles.wizardStepRow}>
                        <View
                            style={[
                                styles.wizardStepDot,
                                setupStep === 'store' ? styles.wizardStepDotActive : undefined,
                            ]}
                        />
                        <Text style={styles.wizardStepText}>Store details</Text>
                    </View>
                </View>
            </View>
            <Animated.View
                style={[
                    styles.keypadCard,
                    setupStep === 'store' ? styles.wizardCardWide : undefined,
                    {
                        opacity: setupContentOpacity,
                        transform: [{ translateY: setupContentTranslateY }],
                    },
                ]}
            >
                <Text style={styles.keypadTitle}>
                    {setupStep === 'employee' ? 'Create owner employee' : 'Store details'}
                </Text>
                <Text style={styles.keypadHint}>
                    {setupStep === 'employee'
                        ? 'This one-time setup creates the first PIN-based employee for the tenant.'
                        : 'These values replace the default placeholders created during bootstrap.'}
                </Text>
                {setupError ? <UIAlert message={setupError} type="error" /> : null}
                {setupStep === 'employee' ? (
                    <FormProvider {...setupForm}>
                        <>
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
                            <UIInput
                                name="pin"
                                placeholder="4-digit PIN"
                                textAlign="left"
                                keyboardType="number-pad"
                                secureTextEntry={true}
                                rules={{ required: 'PIN is required' }}
                            />
                            <UIInput
                                name="confirmPin"
                                placeholder="Confirm 4-digit PIN"
                                textAlign="left"
                                keyboardType="number-pad"
                                secureTextEntry={true}
                                rules={{ required: 'PIN confirmation is required' }}
                            />
                            <Button
                                title="Continue"
                                buttonStyle={styles.setupButton}
                                loading={setupSaving}
                                onPress={setupForm.handleSubmit(onCreateOwnerEmployee)}
                            />
                        </>
                    </FormProvider>
                ) : (
                    <FormProvider {...storeSetupForm}>
                        <>
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
                            <Button
                                title="Finish setup"
                                buttonStyle={styles.setupButton}
                                loading={setupSaving}
                                onPress={storeSetupForm.handleSubmit(onSaveStoreDetails)}
                            />
                        </>
                    </FormProvider>
                )}
            </Animated.View>
        </View>
    );
}
