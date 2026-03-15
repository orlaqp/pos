import { getThemeColors, useSharedStyles } from '@pos/theme/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, Text, Button, Icon, Input } from '@rneui/themed';
import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';

import { useDispatch, useSelector } from 'react-redux';
import { Role } from '@pos/auth/data-access';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { UIKeyPad, UIInput, UIAlert } from '@pos/shared/ui-native';
import { employeesActions, EmployeeService, selectAllEmployees, selectLoginEmployee } from '@pos/employees/data-access';
import { StationService } from '@pos/settings/data-access';
import { cartActions } from '@pos/sales/data-access';
import brandMark from '../../assets/branding/pos-icon-transparent-2048.png';
import { RootState } from '@pos/store';
import { selectStore, StoreInfoService } from '@pos/store-info/data-access';

interface PathDetails {
    title: string;
    path: string;
    icon: string;
    role: string;
    params?: object;
    validate?: () => Promise<string | null>;
}

interface HomeScreenProps {
    navigation: NativeStackNavigationProp<Record<string, object | undefined>>;
}

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

const getOwnerNameParts = (name?: string) => {
    const trimmed = name?.trim() || '';
    if (!trimmed) {
        return { firstName: 'Owner', lastName: '' };
    }

    const parts = trimmed.split(/\s+/);
    return {
        firstName: parts[0] || 'Owner',
        lastName: parts.slice(1).join(' '),
    };
};

export const HomeScreen = (props: HomeScreenProps) => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const colors = getThemeColors(theme);
    const sharedStyles = useSharedStyles();
    const styles = useStyles();
    const employee = useSelector(selectLoginEmployee);
    const employees = useSelector(selectAllEmployees);
    const store = useSelector(selectStore);
    const user = useSelector((state: RootState) => state.auth.user);
    const businessName = useSelector((state: RootState) => state.tenantSession.businessName);
    const [pin, setPin] = useState<string>('');
    const [setupError, setSetupError] = useState<string | null>(null);
    const [setupSaving, setSetupSaving] = useState(false);
    const [setupStep, setSetupStep] = useState<'employee' | 'store'>('employee');
    const [pendingOwnerEmployee, setPendingOwnerEmployee] = useState<any>(null);
    const setupForm = useForm<FirstEmployeeSetupModel>({
        mode: 'onChange',
        defaultValues: {
            name: user?.name?.trim() || '',
            phone: store?.phone === '000-000-0000' ? '' : store?.phone || '',
            pin: '',
            confirmPin: '',
        },
    });
    const storeSetupForm = useForm<StoreSetupModel>({
        mode: 'onChange',
        defaultValues: {
            name: store?.name || businessName || '',
            phone: store?.phone || '',
            email: store?.email || user?.email || '',
            streetAddress:
                store?.address === 'Update in settings' ? '' : store?.address || '',
            city: store?.city === 'Update in settings' ? '' : store?.city || '',
            state: store?.state === 'NA' ? '' : store?.state || '',
            zipCode: store?.zipCode === '00000' ? '' : store?.zipCode || '',
            country: store?.country || 'US',
        },
    });
    const storeNeedsSetup =
        !store ||
        store.address === 'Update in settings' ||
        store.city === 'Update in settings' ||
        store.state === 'NA' ||
        store.zipCode === '00000' ||
        store.phone === '000-000-0000';
    const needsInitialEmployee = employees.length === 0;
    const needsSetupWizard = !employee && (needsInitialEmployee || storeNeedsSetup);

    const paths: PathDetails[] = useMemo(() => [
        {
            title: 'Sales',
            path: 'Sales',
            icon: 'cart-outline',
            role: Role.Sales,
            params: { mode: 'order' },
            validate: async () => {
                dispatch(cartActions.reset());
                const res = await StationService.isStationNumberSet();
                return res ? null : 'Please make sure station number is set before making sales';
            }
        },
        {
            title: 'Payments',
            path: 'Payments',
            icon: 'cash-register',
            role: Role.Payments,
        },
        {
            title: 'Back Office',
            path: 'BackOffice',
            icon: 'chart-box-outline',
            role: Role.Admin,
        },
    ], [dispatch]);

    const goto = (details: PathDetails) => {
        if (!details.validate) {
            return props.navigation.navigate(details.path, details.params);
        }

        details.validate().then((msg) => {
            if (!msg) {
                return props.navigation.navigate(details.path, details.params);
            }

            Alert.alert(msg);
        });
    };

    const onPinUpdated = (nextPin: string) => {
        if (nextPin.length <= 4) {
            setPin(nextPin);
            return nextPin;
        }

        return pin;
    };

    useEffect(() => {
        if (pin.length !== 4) return;

        EmployeeService.getEmployee(pin)
            .then((emp) => {
                if (!emp) {
                    Alert.alert('The PIN number you entered is not valid');
                    setPin('');
                    return;
                }
                dispatch(employeesActions.loginEmployee(emp));
                setPin('');
            })
            .catch((error) => {
                console.error('PIN login failed', error);
                Alert.alert('Unable to validate PIN at the moment. Please try again.');
                setPin('');
            });
    }, [dispatch, pin]);

    useEffect(() => {
        setPin('');
    }, [employee]);

    useEffect(() => {
        if (needsInitialEmployee) {
            setSetupStep('employee');
            return;
        }

        if (storeNeedsSetup) {
            setSetupStep('store');
        }
    }, [needsInitialEmployee, storeNeedsSetup]);

    useEffect(() => {
        storeSetupForm.reset({
            name: store?.name || businessName || '',
            phone: store?.phone === '000-000-0000' ? '' : store?.phone || '',
            email: store?.email || user?.email || '',
            streetAddress:
                store?.address === 'Update in settings' ? '' : store?.address || '',
            city: store?.city === 'Update in settings' ? '' : store?.city || '',
            state: store?.state === 'NA' ? '' : store?.state || '',
            zipCode: store?.zipCode === '00000' ? '' : store?.zipCode || '',
            country: store?.country || 'US',
        });
    }, [businessName, store, storeSetupForm, user?.email]);

    const createOwnerEmployee = async (model: FirstEmployeeSetupModel) => {
        const trimmedPin = model.pin.trim();

        if (!/^\d{4}$/.test(trimmedPin)) {
            setSetupError('PIN must be exactly 4 digits');
            return;
        }

        if (trimmedPin !== model.confirmPin.trim()) {
            setSetupError('PIN confirmation does not match');
            return;
        }

        setSetupSaving(true);
        setSetupError(null);

        try {
            const ownerName = getOwnerNameParts(model.name || user?.name);
            const newEmployee = {
                code: 'OWNER',
                firstName: ownerName.firstName,
                lastName: ownerName.lastName || null,
                middleName: null,
                dob: null,
                phone: model.phone.trim() || store?.phone || null,
                email: user?.email || null,
                pin: trimmedPin,
                roles: Object.values(Role),
                active: true,
            };

            await EmployeeService.save(dispatch, newEmployee);
            setPendingOwnerEmployee(newEmployee);
            setSetupStep('store');
            setupForm.reset({
                name: model.name,
                phone: model.phone,
                pin: '',
                confirmPin: '',
            });
        } catch (error) {
            console.error('Initial employee setup failed', error);
            setSetupError(
                error instanceof Error ? error.message : 'Unable to create owner employee'
            );
        } finally {
            setSetupSaving(false);
        }
    };

    const saveStoreDetails = async (model: StoreSetupModel) => {
        setSetupSaving(true);
        setSetupError(null);

        try {
            await StoreInfoService.save(dispatch, {
                id: store?.id,
                name: model.name.trim(),
                phone: model.phone.trim(),
                email: model.email.trim(),
                address: model.streetAddress.trim(),
                city: model.city.trim(),
                state: model.state.trim(),
                zipCode: model.zipCode.trim(),
                country: model.country.trim(),
                fax: store?.fax || '',
                disclaimer: store?.disclaimer || '',
            });

            if (pendingOwnerEmployee) {
                dispatch(employeesActions.loginEmployee(pendingOwnerEmployee));
                setPendingOwnerEmployee(null);
            }
        } catch (error) {
            console.error('Store setup failed', error);
            setSetupError(
                error instanceof Error ? error.message : 'Unable to save store details'
            );
        } finally {
            setSetupSaving(false);
        }
    };

    return (
        <ScrollView
            style={[sharedStyles.page, styles.container]}
            contentContainerStyle={styles.containerContent}
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="automatic"
        >
            {needsSetupWizard ? (
                <View style={styles.shell}>
                    <View style={styles.hero}>
                        <Image source={brandMark} style={styles.brandMark} resizeMode="contain" />
                        <Text style={styles.businessLabel}>{businessName || 'Business workspace'}</Text>
                        <Text style={styles.heroTitle}>
                            {setupStep === 'employee'
                                ? 'Finish owner setup'
                                : 'Add store details'}
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
                    <View
                        style={[
                            styles.keypadCard,
                            setupStep === 'store' ? styles.wizardCardWide : undefined,
                        ]}
                    >
                        <Text style={styles.keypadTitle}>
                            {setupStep === 'employee'
                                ? 'Create owner employee'
                                : 'Store details'}
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
                                        onPress={setupForm.handleSubmit(createOwnerEmployee)}
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
                                        onPress={storeSetupForm.handleSubmit(saveStoreDetails)}
                                    />
                                </>
                            </FormProvider>
                        )}
                    </View>
                </View>
            ) : !employee ? (
                <View style={styles.shell}>
                    <View style={styles.hero}>
                        <Image source={brandMark} style={styles.brandMark} resizeMode="contain" />
                        <Text style={styles.businessLabel}>{businessName || 'Business workspace'}</Text>
                        <Text style={styles.heroTitle}>Employee PIN</Text>
                        <Text style={styles.heroSubtitle}>
                            Admin session is active for {user?.email || 'this device'}. Enter a staff PIN to continue into the operational app.
                        </Text>
                    </View>
                    <View style={styles.keypadCard}>
                        <Text style={styles.keypadTitle}>Shared device access</Text>
                        <Text style={styles.keypadHint}>PIN is required every time the app is reopened.</Text>
                        <UIKeyPad initialValue={''} onChange={onPinUpdated} />
                    </View>
                </View>
            ) : (
                <View style={styles.routeGrid}>
                    {paths.map((p) => {
                        if (!employee.roles?.includes(p.role)) return null;

                        return (
                            <TouchableOpacity
                                onPress={() => goto(p)}
                                key={p.title}
                                testID={`home-nav-${p.path.toLowerCase()}`}
                            >
                                <View style={[styles.bigButton, sharedStyles.centered]}>
                                    <View style={styles.routeIconWrap}>
                                        <Icon
                                            name={p.icon}
                                            type="material-community"
                                            size={56}
                                            color="#dbeafe"
                                        />
                                    </View>
                                    <Text style={styles.routeTitle}>{p.title}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </ScrollView>
    );
};

const useStyles = () => {
    const theme = useTheme();
    const colors = getThemeColors(theme);
    const sharedStyles = useSharedStyles();

    return StyleSheet.create({
        ...sharedStyles,
        container: {
            flex: 1,
            paddingHorizontal: 24,
            backgroundColor: '#05070b',
        },
        containerContent: {
            flexGrow: 1,
            justifyContent: 'center',
            paddingVertical: 32,
        },
        shell: {
            flexDirection: 'row',
            gap: 18,
            alignItems: 'stretch',
        },
        hero: {
            flex: 1,
            backgroundColor: '#10141b',
            borderRadius: 28,
            padding: 28,
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.08)',
        },
        businessLabel: {
            color: '#7eb6ff',
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: 12,
            fontSize: 12,
            fontWeight: '700',
        },
        heroTitle: {
            color: '#f3f7ff',
            fontSize: 38,
            fontWeight: '700',
            marginBottom: 12,
        },
        heroSubtitle: {
            color: '#a3adba',
            fontSize: 16,
            lineHeight: 24,
            maxWidth: 420,
        },
        keypadCard: {
            width: 360,
            backgroundColor: '#10141b',
            borderRadius: 28,
            padding: 24,
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.08)',
            shadowColor: '#000',
            shadowOpacity: 0.24,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
        },
        wizardCardWide: {
            width: 640,
        },
        keypadTitle: {
            color: '#f4f8ff',
            fontSize: 26,
            fontWeight: '700',
            marginBottom: 8,
            textAlign: 'center',
        },
        keypadHint: {
            color: '#a3adba',
            textAlign: 'center',
            marginBottom: 20,
            lineHeight: 20,
        },
        setupButton: {
            borderRadius: 16,
            minHeight: 52,
            marginTop: 12,
            backgroundColor: colors.primary,
        },
        formRow: {
            flexDirection: 'row',
            gap: 14,
        },
        formColumn: {
            flex: 1,
        },
        fullWidthInputContainer: {
            width: '100%',
            paddingHorizontal: 0,
            marginTop: 10,
        },
        fullWidthInputField: {
            ...sharedStyles.inputContainerStyle,
            borderBottomWidth: 0,
        },
        fullWidthInputText: {
            ...sharedStyles.inputStyle,
            textAlign: 'left',
        },
        formSpacer: {
            minHeight: 1,
        },
        wizardSteps: {
            marginTop: 20,
            gap: 12,
        },
        wizardStepRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        wizardStepDot: {
            width: 12,
            height: 12,
            borderRadius: 6,
            marginRight: 10,
            backgroundColor: 'rgba(255,255,255,0.16)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
        },
        wizardStepDotActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        wizardStepDotComplete: {
            backgroundColor: '#34c759',
            borderColor: '#34c759',
        },
        wizardStepText: {
            color: '#c7d0dc',
            fontSize: 15,
        },
        brandMark: {
            width: 110,
            height: 110,
            marginBottom: 18,
            opacity: 0.98,
        },
        routeGrid: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },
        bigButton: {
            backgroundColor: '#10141b',
            borderRadius: 24,
            margin: 15,
            padding: 24,
            minWidth: 220,
            minHeight: 220,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
        },
        routeIconWrap: {
            width: 108,
            height: 108,
            borderRadius: 28,
            backgroundColor: '#1b3a67',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 18,
            borderWidth: 1,
            borderColor: 'rgba(126, 182, 255, 0.18)',
        },
        routeTitle: {
            color: '#f3f7ff',
            fontSize: 22,
            fontWeight: '700',
            textAlign: 'center',
        },
    });
};
