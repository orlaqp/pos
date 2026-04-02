import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@rneui/themed';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Alert, ScrollView, Animated, Image } from 'react-native';

import { useDispatch, useSelector } from 'react-redux';
import {
    authActions,
    clearRememberedAdminCredentials,
    clearCurrentTenantContext,
    getRememberedAdminCredentialStatus,
    Role,
    tenantSessionActions,
} from '@pos/auth/data-access';
import { useForm } from 'react-hook-form';
import {
    employeesActions,
    EmployeeService,
    selectAllEmployees,
    selectInitialEmployeeSyncComplete,
    selectLoadingStatus as selectEmployeesLoadingStatus,
    selectLoginEmployee,
} from '@pos/employees/data-access';
import { selectStation } from '@pos/settings/data-access';
import { cartActions } from '@pos/sales/data-access';
import brandMark from '../../assets/branding/pos-icon-transparent-2048.png';
import { RootState } from '@pos/store';
import {
    isStoreInfoIncomplete,
    selectInitialStoreSyncComplete,
    selectStore,
    StoreInfoService,
} from '@pos/store-info/data-access';
import { useHomeScreenStyles } from './HomeScreen.styles';
import { HomeSetupWizard } from './home-setup-wizard';
import { HomePinLogin } from './home-pin-login';
import { HomeRouteGrid } from './home-route-grid';
import {
    clearPinLockState,
    formatLockCountdown,
    MAX_PIN_ATTEMPTS,
    PIN_LOCK_DURATION_MS,
    PinLockState,
    readPinLockState,
    writePinLockState,
} from './use-pin-lock';
import { E2E_MANAGER_PIN } from '@pos/shared/utils';
import { Auth, DataStore } from '@pos/shared/amplify';
import { markManualSignOut } from './session-signout';

interface PathDetails {
    title: string;
    path: string;
    icon: string;
    accentColor: string;
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

type PendingOwnerEmployee = {
    code: string;
    firstName: string;
    lastName: string | null;
    middleName: null;
    dob: null;
    phone: string | null;
    email: string | null;
    pin: string;
    roles: Array<(typeof Role)[keyof typeof Role]>;
    active: boolean;
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
    const styles = useHomeScreenStyles();
    const employee = useSelector(selectLoginEmployee);
    const employees = useSelector(selectAllEmployees);
    const initialEmployeeSyncComplete = useSelector(selectInitialEmployeeSyncComplete);
    const employeesLoadingStatus = useSelector(selectEmployeesLoadingStatus);
    const store = useSelector(selectStore);
    const initialStoreSyncComplete = useSelector(selectInitialStoreSyncComplete);
    const user = useSelector((state: RootState) => state.auth.user);
    const businessName = useSelector((state: RootState) => state.tenantSession.businessName);
    const station = useSelector(selectStation);
    const [pin, setPin] = useState<string>('');
    const [invalidPinAttempt, setInvalidPinAttempt] = useState(0);
    const [pinResetToken, setPinResetToken] = useState(0);
    const [pinLockState, setPinLockState] = useState<PinLockState>({
        failedAttempts: 0,
        lockedUntil: null,
    });
    const [lockNow, setLockNow] = useState<number>(Date.now());
    const [setupError, setSetupError] = useState<string | null>(null);
    const [setupSaving, setSetupSaving] = useState(false);
    const [savedLoginStatusLabel, setSavedLoginStatusLabel] = useState(
        'Checking saved login on this device...'
    );
    const [pendingRoutePath, setPendingRoutePath] = useState<string | null>(null);
    const [setupStep, setSetupStep] = useState<'employee' | 'store'>('employee');
    const [pendingOwnerEmployee, setPendingOwnerEmployee] =
        useState<PendingOwnerEmployee | null>(null);
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
    const storeNeedsSetup = initialStoreSyncComplete && isStoreInfoIncomplete(store);
    const accessSyncInProgress =
        !employee && (!initialEmployeeSyncComplete || !initialStoreSyncComplete);
    const needsInitialEmployee =
        !accessSyncInProgress &&
        !employee &&
        employees.length === 0;
    const needsSetupWizard =
        !accessSyncInProgress &&
        !employee &&
        (needsInitialEmployee || storeNeedsSetup);
    const paths: PathDetails[] = useMemo(() => [
        {
            title: 'Sales',
            path: 'Sales',
            icon: 'cart-outline',
            accentColor: '#4db8ff',
            role: Role.Sales,
            params: { mode: 'order' },
            validate: async () => {
                dispatch(cartActions.reset());
                return station?.stationNumber
                    ? null
                    : 'Please make sure station number is set before making sales';
            }
        },
        {
            title: 'Payments',
            path: 'Payments',
            icon: 'cash-register',
            accentColor: '#58c472',
            role: Role.Payments,
        },
        {
            title: 'Back Office',
            path: 'BackOffice',
            icon: 'chart-box-outline',
            accentColor: '#d8a24a',
            role: Role.Admin,
        },
    ], [dispatch, station?.stationNumber]);
    const visiblePaths = useMemo(
        () => paths.filter((p) => employee?.roles?.includes(p.role)),
        [employee?.roles, paths]
    );
    const routeAnimations = useMemo(
        () => visiblePaths.map(() => new Animated.Value(0)),
        [visiblePaths]
    );
    const setupContentOpacity = useRef(new Animated.Value(1)).current;
    const setupContentTranslateY = useRef(new Animated.Value(0)).current;
    const lockedUntil = pinLockState.lockedUntil;
    const isPinLocked = !!lockedUntil && lockedUntil > lockNow;
    const remainingPinAttempts = Math.max(
        0,
        MAX_PIN_ATTEMPTS - pinLockState.failedAttempts
    );
    const pinLockMessage = isPinLocked
        ? `Too many invalid PIN attempts. Try again in ${formatLockCountdown(
              lockedUntil - lockNow
          )}.`
        : null;
    const pinAttemptsMessage =
        !isPinLocked && pinLockState.failedAttempts > 0
            ? `${remainingPinAttempts} ${
                  remainingPinAttempts === 1 ? 'attempt' : 'attempts'
              } remaining before this device locks for 5 minutes.`
            : null;

    const goto = (details: PathDetails) => {
        if (pendingRoutePath) {
            return;
        }

        setPendingRoutePath(details.path);

        if (!details.validate) {
            props.navigation.navigate(details.path, details.params);
            setPendingRoutePath(null);
            return;
        }

        details.validate().then((msg) => {
            if (!msg) {
                props.navigation.navigate(details.path, details.params);
                setPendingRoutePath(null);
                return;
            }

            setPendingRoutePath(null);
            Alert.alert(msg);
        }).catch(() => {
            setPendingRoutePath(null);
            Alert.alert('Unable to open this screen right now. Please try again.');
        });
    };

    const onPinUpdated = (nextPin: string) => {
        if (isPinLocked) {
            return '';
        }

        if (nextPin.length <= 4) {
            setPin(nextPin);
            return nextPin;
        }

        return pin;
    };

    const resetPinEntry = () => {
        setPin('');
        setPinResetToken((current) => current + 1);
    };

    const clearPinGuard = useCallback(async () => {
        setInvalidPinAttempt(0);
        const clearedState: PinLockState = {
            failedAttempts: 0,
            lockedUntil: null,
        };
        setPinLockState(clearedState);
        await clearPinLockState();
    }, []);

    const loginWithE2EManager = useCallback(async () => {
        try {
            const emp = await EmployeeService.getEmployee(E2E_MANAGER_PIN);
            if (!emp) {
                return;
            }

            await clearPinGuard();
            dispatch(employeesActions.loginEmployee(emp));
            resetPinEntry();
        } catch (error) {
            console.error('E2E manager login failed', error);
        }
    }, [clearPinGuard, dispatch]);

    const confirmLogoff = useCallback(() => {
        Alert.alert('Log off business?', 'This will sign out the admin session on this device.', [
            { text: 'Cancel' },
            {
                text: 'Log off',
                onPress: async () => {
                    try {
                        await markManualSignOut();
                        await Auth.signOut('local');
                        await DataStore.stop();
                    } finally {
                        clearCurrentTenantContext();
                        dispatch(authActions.logoff());
                        dispatch(tenantSessionActions.clearTenantSession());
                        dispatch(employeesActions.logoffEmployee());
                    }
                },
            },
        ]);
    }, [dispatch]);

    const refreshSavedLoginStatus = useCallback(async () => {
        const status = await getRememberedAdminCredentialStatus();
        setSavedLoginStatusLabel(
            status.enabled
                ? `Saved login enabled on this device${status.username ? ` for ${status.username}` : ''}.`
                : 'No saved login stored on this device.'
        );
    }, []);

    const removeSavedLogin = useCallback(() => {
        Alert.alert(
            'Remove saved login?',
            'This only removes the stored admin username and password from this device. Your current admin session will stay active.',
            [
                { text: 'Cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        await clearRememberedAdminCredentials();
                        await refreshSavedLoginStatus();
                        Alert.alert(
                            'Saved login removed',
                            'The stored admin credentials were removed from this device.'
                        );
                    },
                },
            ]
        );
    }, [refreshSavedLoginStatus]);

    const recordFailedPinAttempt = useCallback(async (message: string) => {
        const nextFailedAttempts = pinLockState.failedAttempts + 1;
        const shouldLock = nextFailedAttempts >= MAX_PIN_ATTEMPTS;
        const nextState: PinLockState = shouldLock
            ? {
                  failedAttempts: 0,
                  lockedUntil: Date.now() + PIN_LOCK_DURATION_MS,
              }
            : {
                  failedAttempts: nextFailedAttempts,
                  lockedUntil: null,
              };

        setInvalidPinAttempt((current) => current + 1);
        setPinLockState(nextState);
        await writePinLockState(nextState);
        resetPinEntry();

        if (shouldLock) {
            Alert.alert(
                'PIN locked',
                'Too many invalid PIN attempts. This device is locked for 5 minutes.'
            );
            return;
        }

        Alert.alert(message);
    }, [pinLockState.failedAttempts]);

    useEffect(() => {
        if (pin.length !== 4) return;
        if (isPinLocked) {
            resetPinEntry();
            return;
        }

        EmployeeService.getEmployee(pin)
            .then(async (emp) => {
                if (!emp) {
                    void recordFailedPinAttempt('The PIN number you entered is not valid');
                    return;
                }

                await clearPinGuard();
                dispatch(employeesActions.loginEmployee(emp));
                resetPinEntry();
            })
            .catch((error) => {
                console.error('PIN login failed', error);
                void recordFailedPinAttempt(
                    'Unable to validate PIN at the moment. Please try again.'
                );
            });
    }, [clearPinGuard, dispatch, isPinLocked, pin, recordFailedPinAttempt]);

    useEffect(() => {
        resetPinEntry();
    }, [employee]);

    useEffect(() => {
        void refreshSavedLoginStatus();
    }, [refreshSavedLoginStatus, user?.email]);

    useEffect(() => {
        let active = true;

        readPinLockState().then((state) => {
            if (!active) return;

            if (state.lockedUntil && state.lockedUntil <= Date.now()) {
                setPinLockState({ failedAttempts: 0, lockedUntil: null });
                void clearPinLockState();
                return;
            }

            setPinLockState(state);
        });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!isPinLocked) return;

        const interval = setInterval(() => {
            const now = Date.now();
            setLockNow(now);

            if (lockedUntil && lockedUntil <= now) {
                setPinLockState({ failedAttempts: 0, lockedUntil: null });
                void clearPinLockState();
                resetPinEntry();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isPinLocked, lockedUntil]);

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

    useEffect(() => {
        if (!needsSetupWizard) return;

        setupContentOpacity.setValue(0);
        setupContentTranslateY.setValue(14);
        Animated.parallel([
            Animated.timing(setupContentOpacity, {
                toValue: 1,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.timing(setupContentTranslateY, {
                toValue: 0,
                duration: 220,
                useNativeDriver: true,
            }),
        ]).start();
    }, [needsSetupWizard, setupContentOpacity, setupContentTranslateY, setupStep]);

    useEffect(() => {
        if (!employee || !visiblePaths.length) return;

        routeAnimations.forEach((value) => value.setValue(0));

        Animated.stagger(
            100,
            routeAnimations.map((value) =>
                Animated.timing(value, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                })
            )
        ).start();
    }, [employee, routeAnimations, visiblePaths.length]);

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

            if (storeNeedsSetup) {
                setPendingOwnerEmployee(newEmployee);
                setSetupStep('store');
            } else {
                dispatch(employeesActions.loginEmployee(newEmployee));
                setPendingOwnerEmployee(null);
            }

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
            const storePayload = {
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
            };

            await StoreInfoService.save(dispatch, {
                ...(store?.id ? { id: store.id } : {}),
                ...storePayload,
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
            testID="home-screen"
            style={[styles.page, styles.container]}
            contentContainerStyle={styles.containerContent}
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="automatic"
        >
            {needsSetupWizard ? (
                <HomeSetupWizard
                    brandMark={brandMark}
                    businessName={businessName}
                    setupStep={setupStep}
                    needsInitialEmployee={needsInitialEmployee}
                    setupContentOpacity={setupContentOpacity}
                    setupContentTranslateY={setupContentTranslateY}
                    setupError={setupError}
                    setupSaving={setupSaving}
                    setupForm={setupForm}
                    storeSetupForm={storeSetupForm}
                    styles={styles}
                    onCreateOwnerEmployee={createOwnerEmployee}
                    onSaveStoreDetails={saveStoreDetails}
                    onLogoff={confirmLogoff}
                />
            ) : !employee && accessSyncInProgress ? (
                <View style={styles.shell}>
                    <View style={styles.hero}>
                        <Image source={brandMark} style={styles.brandMark} resizeMode="contain" />
                        <Text style={styles.businessLabel}>{businessName || 'Business workspace'}</Text>
                        <Text style={styles.heroTitle}>Syncing employee access</Text>
                        <Text style={styles.heroSubtitle}>
                            Syncing staff records for this tenant before showing the PIN screen or setup flow.
                        </Text>
                    </View>
                    <View style={styles.keypadCard}>
                        <Text style={styles.keypadTitle}>Preparing employee access</Text>
                        <Text style={styles.keypadHint}>
                            The PIN screen will appear once employee sync finishes.
                        </Text>
                    </View>
                </View>
            ) : !employee ? (
                <HomePinLogin
                    brandMark={brandMark}
                    businessName={businessName}
                    userEmail={user?.email}
                    pin={pin}
                    pinLockMessage={pinLockMessage}
                    pinAttemptsMessage={pinAttemptsMessage}
                    invalidPinAttempt={invalidPinAttempt}
                    pinResetToken={pinResetToken}
                    isPinLocked={isPinLocked}
                    styles={styles}
                    onPinUpdated={onPinUpdated}
                    onE2EManagerLogin={loginWithE2EManager}
                    onLogoff={confirmLogoff}
                    savedLoginStatusLabel={savedLoginStatusLabel}
                    pendingOrderStatusLabel="Order journal entries stay on this device until you retry them manually."
                    onRemoveSavedLogin={removeSavedLogin}
                />
            ) : (
                <View testID="home-ready-shell">
                    <HomeRouteGrid
                        paths={visiblePaths}
                        routeAnimations={routeAnimations}
                        styles={styles}
                        onGoTo={goto}
                        pendingPath={pendingRoutePath}
                    />
                </View>
            )}
        </ScrollView>
    );
};
