import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@rneui/themed';
import i18next from 'i18next';
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
    selectLoginEmployee,
} from '@pos/employees/data-access';
import { selectStation } from '@pos/settings/data-access';
import { cartActions } from '@pos/sales/data-access';
import brandMark from '../../assets/branding/pos-icon-transparent-2048.png';
import { RootState } from '@pos/store';
import {
    selectAllSyncHealth,
    selectNetworkActive,
    selectOutboxEmpty,
} from '@pos/shared/data-store';
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
import {
    E2E_MANAGER_PIN,
    isE2EEnabled,
    isNativeE2ERequested,
    translateWithFallback,
} from '@pos/shared/utils';
import {
    Auth,
    DataStore,
    getDataStoreLifecycleState,
} from '@pos/shared/amplify';
import { markManualSignOut } from './session-signout';
import {
    buildPreviousSessionSummary,
    readCurrentAppLifecycleSession,
    readPreviousAppLifecycleSession,
} from './app-lifecycle-diagnostics';
import {
    isNativeLifecycleDiagnosticsAvailable,
    readCurrentNativeLifecycleSession,
    readPreviousNativeLifecycleSession,
} from './native-lifecycle-diagnostics';

interface PathDetails {
    eyebrow?: string;
    title: string;
    path: string;
    icon: string;
    accentColor: string;
    role: string;
    subtitle?: string;
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

const formatLifecycleEvent = (event: {
    at: string;
    name: string;
    details?: Record<string, unknown>;
}) => {
    const details =
        event.details && Object.keys(event.details).length > 0
            ? ` ${JSON.stringify(event.details)}`
            : '';

    return `${event.at}  ${event.name}${details}`;
};

const getOwnerNameParts = (name?: string, ownerFallback = 'Owner') => {
    const trimmed = name?.trim() || '';
    if (!trimmed) {
        return { firstName: ownerFallback, lastName: '' };
    }

    const parts = trimmed.split(/\s+/);
    return {
        firstName: parts[0] || ownerFallback,
        lastName: parts.slice(1).join(' '),
    };
};

export const HomeScreen = (props: HomeScreenProps) => {
    const dispatch = useDispatch();
    const t = translateWithFallback;
    const styles = useHomeScreenStyles();
    const employee = useSelector(selectLoginEmployee);
    const employees = useSelector(selectAllEmployees);
    const initialEmployeeSyncComplete = useSelector(selectInitialEmployeeSyncComplete);
    const store = useSelector(selectStore);
    const initialStoreSyncComplete = useSelector(selectInitialStoreSyncComplete);
    const user = useSelector((state: RootState) => state.auth.user);
    const businessName = useSelector((state: RootState) => state.tenantSession.businessName);
    const currentTenantId = useSelector(
        (state: RootState) => state.tenantSession.currentTenantId
    );
    const station = useSelector(selectStation);
    const networkActive = useSelector(selectNetworkActive);
    const outboxEmpty = useSelector(selectOutboxEmpty);
    const syncHealth = useSelector(selectAllSyncHealth);
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
        t('HOME_SavedLoginChecking', 'Checking saved login on this device...')
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
    const { reset: resetStoreSetupForm } = storeSetupForm;
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
            eyebrow: t('HOME_PathSalesEyebrow', 'Sales'),
            title: t('HOME_PathSalesTitle', 'Sales'),
            path: 'Sales',
            icon: 'cart-outline',
            accentColor: '#4db8ff',
            role: Role.Sales,
            subtitle: t(
                'HOME_PathSalesSubtitle',
                'Start a new ticket, browse products, and move straight into checkout.'
            ),
            params: { mode: 'order' },
            validate: async () => {
                dispatch(cartActions.reset());
                return station?.stationNumber
                    ? null
                    : t(
                          'HOME_StationRequiredForSales',
                          'Please make sure station number is set before making sales'
                      );
            }
        },
        {
            eyebrow: t('HOME_PathPaymentsEyebrow', 'Payments'),
            title: t('HOME_PathPaymentsTitle', 'Payments'),
            path: 'Payments',
            icon: 'cash-register',
            accentColor: '#58c472',
            role: Role.Payments,
            subtitle: t(
                'HOME_PathPaymentsSubtitle',
                'Review open orders, take payment, and manage post-sale collection.'
            ),
        },
        {
            eyebrow: t('HOME_PathBackOfficeEyebrow', 'Back Office'),
            title: t('HOME_PathBackOfficeTitle', 'Back Office'),
            path: 'BackOffice',
            icon: 'chart-box-outline',
            accentColor: '#d8a24a',
            role: Role.Admin,
            subtitle: t(
                'HOME_PathBackOfficeSubtitle',
                'Open reporting, inventory, catalog, employees, and configuration tools.'
            ),
        },
    ], [dispatch, station?.stationNumber, t, i18next.language]);
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
        ? t(
              'HOME_PinLockedCountdownMessage',
              'Too many invalid PIN attempts. Try again in {{remaining}}.',
              {
                  remaining: formatLockCountdown(lockedUntil - lockNow),
              }
          )
        : null;
    const pinAttemptsMessage =
        !isPinLocked && pinLockState.failedAttempts > 0
            ? t(
                  'HOME_PinAttemptsRemainingMessage',
                  '{{count}} attempts remaining before this device locks for 5 minutes.',
                  { count: remainingPinAttempts }
              )
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
            Alert.alert(
                t(
                    'HOME_UnableToOpenScreen',
                    'Unable to open this screen right now. Please try again.'
                )
            );
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

    const e2eAutoManagerLoginStartedRef = useRef(false);

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

    useEffect(() => {
        if (
            typeof __DEV__ === 'undefined' ||
            !__DEV__ ||
            !isNativeE2ERequested()
        ) {
            return;
        }

        if (!isE2EEnabled() || employee || accessSyncInProgress || isPinLocked) {
            e2eAutoManagerLoginStartedRef.current = false;
            return;
        }

        if (e2eAutoManagerLoginStartedRef.current) {
            return;
        }

        e2eAutoManagerLoginStartedRef.current = true;
        void loginWithE2EManager();
    }, [accessSyncInProgress, employee, isPinLocked, loginWithE2EManager]);

    const confirmLogoff = useCallback(() => {
        Alert.alert(
            t('HOME_LogoffBusinessTitle', 'Log off business?'),
            t(
                'HOME_LogoffBusinessMessage',
                'This will sign out the admin session on this device.'
            ),
            [
            { text: t('COMMON_Cancel', 'Cancel') },
            {
                text: t('HOME_LogoffBusinessConfirm', 'Log off'),
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
    }, [dispatch, t]);

    const refreshSavedLoginStatus = useCallback(async () => {
        const status = await getRememberedAdminCredentialStatus();
        setSavedLoginStatusLabel(
            status.enabled
                ? t(
                      'HOME_SavedLoginEnabled',
                      'Saved login enabled on this device{{usernameSuffix}}.',
                      {
                          usernameSuffix: status.username ? ` for ${status.username}` : '',
                      }
                  )
                : t('HOME_NoSavedLogin', 'No saved login stored on this device.')
        );
    }, [t]);

    const removeSavedLogin = useCallback(() => {
        Alert.alert(
            t('HOME_RemoveSavedLoginTitle', 'Remove saved login?'),
            t(
                'HOME_RemoveSavedLoginMessage',
                'This only removes the stored admin username and password from this device. Your current admin session will stay active.'
            ),
            [
                { text: t('COMMON_Cancel', 'Cancel') },
                {
                    text: t('HOME_RemoveSavedLoginConfirm', 'Remove'),
                    style: 'destructive',
                    onPress: async () => {
                        await clearRememberedAdminCredentials();
                        await refreshSavedLoginStatus();
                        Alert.alert(
                            t('HOME_SavedLoginRemovedTitle', 'Saved login removed'),
                            t(
                                'HOME_SavedLoginRemovedMessage',
                                'The stored admin credentials were removed from this device.'
                            )
                        );
                    },
                },
            ]
        );
    }, [refreshSavedLoginStatus, t]);

    const openAppDiagnostics = useCallback(async () => {
        const [
            previousSession,
            currentSession,
            previousNativeSession,
            currentNativeSession,
        ] = await Promise.all([
            readPreviousAppLifecycleSession(),
            readCurrentAppLifecycleSession(),
            readPreviousNativeLifecycleSession(),
            readCurrentNativeLifecycleSession(),
        ]);

        const previousSummary = buildPreviousSessionSummary(previousSession);
        const previousEvents = previousSession?.events.slice(-8) || [];
        const currentEvents = currentSession?.events.slice(-6) || [];
        const previousNativeSummary = buildPreviousSessionSummary(previousNativeSession);
        const previousNativeEvents = previousNativeSession?.events.slice(-10) || [];
        const currentNativeEvents = currentNativeSession?.events.slice(-8) || [];
        const syncHealthSummary = Object.values(syncHealth)
            .sort((left, right) => left.model.localeCompare(right.model))
            .map((entry) =>
                [
                    entry.model,
                    `status=${entry.status}`,
                    `subs=${entry.subscriberCount}`,
                    entry.tenantId ? `tenant=${entry.tenantId}` : null,
                    entry.lastSnapshotAt
                        ? `snapshot=${entry.lastSnapshotAt}`
                        : null,
                    entry.lastRecoveryAttemptAt
                        ? `recovery=${entry.lastRecoveryAttemptAt}`
                        : null,
                    entry.lastRecoveryError
                        ? `recoveryError=${entry.lastRecoveryError}`
                        : null,
                    entry.lastError ? `error=${entry.lastError}` : null,
                ]
                    .filter(Boolean)
                    .join(' | ')
            );

        const sections = [
            [
                t('HOME_DiagnosticsSyncStatus', 'Sync status'),
                t('HOME_DiagnosticsTenant', 'Tenant: {{value}}', {
                    value: currentTenantId || t('COMMON_None', 'none'),
                }),
                t('HOME_DiagnosticsDataStoreLifecycle', 'DataStore lifecycle: {{value}}', {
                    value: getDataStoreLifecycleState(),
                }),
                t('HOME_DiagnosticsNetworkActive', 'Network active: {{value}}', {
                    value: String(networkActive),
                }),
                t('HOME_DiagnosticsOutboxEmpty', 'Outbox empty: {{value}}', {
                    value: String(outboxEmpty),
                }),
                syncHealthSummary.length > 0
                    ? syncHealthSummary.join('\n')
                    : t(
                          'HOME_DiagnosticsNoSyncSubscriptions',
                          'No shared sync subscriptions are currently active.'
                      ),
            ].join('\n'),
            previousSummary
                ? t(
                      'HOME_DiagnosticsPreviousSession',
                      'Previous session\nStarted: {{startedAt}}\nEnded: {{endedAt}}\nLast event: {{lastEvent}}\nEvents: {{eventCount}}',
                      {
                          startedAt: previousSummary.startedAt,
                          endedAt: previousSummary.endedAt || t('COMMON_Unknown', 'unknown'),
                          lastEvent: previousSummary.lastEvent || t('COMMON_Unknown', 'unknown'),
                          eventCount: previousSummary.eventCount,
                      }
                  )
                : t(
                      'HOME_DiagnosticsNoPreviousSession',
                      'Previous session\nNo previous session diagnostics recorded on this device yet.'
                  ),
            previousEvents.length > 0
                ? t('HOME_DiagnosticsPreviousEvents', 'Previous events\n{{events}}', {
                      events: previousEvents.map(formatLifecycleEvent).join('\n'),
                  })
                : t('HOME_DiagnosticsNoPreviousEvents', 'Previous events\nNo stored events.'),
            currentEvents.length > 0
                ? t('HOME_DiagnosticsCurrentSession', 'Current session\n{{events}}', {
                      events: currentEvents.map(formatLifecycleEvent).join('\n'),
                  })
                : t(
                      'HOME_DiagnosticsNoCurrentSessionEvents',
                      'Current session\nNo current session events recorded yet.'
                  ),
        ];

        if (isNativeLifecycleDiagnosticsAvailable()) {
            sections.push(
                previousNativeSummary
                    ? t(
                          'HOME_DiagnosticsNativePreviousSession',
                          'Native previous session\nStarted: {{startedAt}}\nEnded: {{endedAt}}\nLast event: {{lastEvent}}\nEvents: {{eventCount}}',
                          {
                              startedAt: previousNativeSummary.startedAt,
                              endedAt:
                                  previousNativeSummary.endedAt ||
                                  t('COMMON_Unknown', 'unknown'),
                              lastEvent:
                                  previousNativeSummary.lastEvent ||
                                  t('COMMON_Unknown', 'unknown'),
                              eventCount: previousNativeSummary.eventCount,
                          }
                      )
                    : t(
                          'HOME_DiagnosticsNoNativePreviousSession',
                          'Native previous session\nNo native previous session diagnostics recorded yet.'
                      )
            );

            sections.push(
                previousNativeEvents.length > 0
                    ? t(
                          'HOME_DiagnosticsNativePreviousEvents',
                          'Native previous events\n{{events}}',
                          {
                              events: previousNativeEvents
                                  .map(formatLifecycleEvent)
                                  .join('\n'),
                          }
                      )
                    : t(
                          'HOME_DiagnosticsNoNativePreviousEvents',
                          'Native previous events\nNo native stored events.'
                      )
            );

            sections.push(
                currentNativeEvents.length > 0
                    ? t(
                          'HOME_DiagnosticsNativeCurrentSession',
                          'Native current session\n{{events}}',
                          {
                              events: currentNativeEvents
                                  .map(formatLifecycleEvent)
                                  .join('\n'),
                          }
                      )
                    : t(
                          'HOME_DiagnosticsNoNativeCurrentSessionEvents',
                          'Native current session\nNo native current session events recorded yet.'
                      )
            );
        }

        Alert.alert(t('HOME_AppDiagnosticsTitle', 'App diagnostics'), sections.join('\n\n'));
    }, [currentTenantId, networkActive, outboxEmpty, syncHealth, t]);

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
                t('HOME_PinLockedTitle', 'PIN locked'),
                t(
                    'HOME_PinLockedMessage',
                    'Too many invalid PIN attempts. This device is locked for 5 minutes.'
                )
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
                    void recordFailedPinAttempt(
                        t('HOME_PinInvalid', 'The PIN number you entered is not valid')
                    );
                    return;
                }

                await clearPinGuard();
                dispatch(employeesActions.loginEmployee(emp));
                resetPinEntry();
            })
            .catch((error) => {
                console.error('PIN login failed', error);
                void recordFailedPinAttempt(
                    t(
                        'HOME_PinValidationFailed',
                        'Unable to validate PIN at the moment. Please try again.'
                    )
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
        resetStoreSetupForm({
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
    }, [
        businessName,
        resetStoreSetupForm,
        store?.address,
        store?.city,
        store?.country,
        store?.email,
        store?.name,
        store?.phone,
        store?.state,
        store?.zipCode,
        user?.email,
    ]);

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
            setSetupError(t('HOME_SetupPinLength', 'PIN must be exactly 4 digits'));
            return;
        }

        if (trimmedPin !== model.confirmPin.trim()) {
            setSetupError(t('HOME_SetupPinMismatch', 'PIN confirmation does not match'));
            return;
        }

        setSetupSaving(true);
        setSetupError(null);

        try {
            const ownerName = getOwnerNameParts(
                model.name || user?.name,
                t('HOME_OwnerFallback', 'Owner')
            );
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
                error instanceof Error ? error.message : t('HOME_SetupOwnerFailed', 'Unable to create owner employee')
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
                error instanceof Error ? error.message : t('HOME_SetupStoreFailed', 'Unable to save store details')
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
                        <Text style={styles.businessLabel}>{businessName || t('HOME_BusinessWorkspace', 'Business workspace')}</Text>
                        <Text style={styles.heroTitle}>{t('HOME_SyncingEmployeeAccessTitle', 'Syncing employee access')}</Text>
                        <Text style={styles.heroSubtitle}>
                            {t(
                                'HOME_SyncingEmployeeAccessSubtitle',
                                'Syncing staff records for this tenant before showing the PIN screen or setup flow.'
                            )}
                        </Text>
                        <View style={styles.setupHeroMetaRow}>
                            <View style={styles.setupHeroMetaCard}>
                                <Text style={styles.setupHeroMetaLabel}>{t('HOME_SyncStageLabel', 'Stage')}</Text>
                                <Text style={styles.setupHeroMetaValue}>{t('HOME_SyncStageValue', 'Employee access')}</Text>
                            </View>
                            <View style={styles.setupHeroMetaCard}>
                                <Text style={styles.setupHeroMetaLabel}>{t('HOME_SyncNextLabel', 'Next')}</Text>
                                <Text style={styles.setupHeroMetaValue}>
                                    {t('HOME_SyncNextValue', 'PIN or setup flow')}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.wizardStepsPanel}>
                            <Text style={styles.wizardStepsEyebrow}>{t('HOME_WhatHappensNext', 'What happens next')}</Text>
                            <View style={styles.wizardStepCard}>
                                <View style={styles.syncPulseDot} />
                                <View style={styles.wizardStepCopy}>
                                    <Text style={styles.wizardStepTitle}>{t('HOME_AccessRecordsSyncTitle', 'Access records sync')}</Text>
                                    <Text style={styles.wizardStepText}>
                                        {t(
                                            'HOME_AccessRecordsSyncText',
                                            'Once shared employee records finish syncing, this device automatically moves into the correct entry flow.'
                                        )}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.keypadCard, styles.syncStatusCard]}>
                        <Text style={styles.setupWizardEyebrow}>{t('HOME_PreparingDeviceEyebrow', 'Preparing device')}</Text>
                        <Text style={styles.keypadTitle}>{t('HOME_PreparingEmployeeAccessTitle', 'Preparing employee access')}</Text>
                        <Text style={styles.keypadHint}>
                            {t('HOME_PreparingEmployeeAccessHint', 'The PIN screen will appear once employee sync finishes.')}
                        </Text>
                        <View style={styles.syncStatusPanel}>
                            <View style={styles.syncStatusRow}>
                                <Text style={styles.syncStatusLabel}>{t('HOME_SyncEmployeeDirectory', 'Employee directory')}</Text>
                                <Text style={styles.syncStatusValue}>{t('HOME_Syncing', 'Syncing')}</Text>
                            </View>
                            <View style={styles.syncStatusDivider} />
                            <View style={styles.syncStatusRow}>
                                <Text style={styles.syncStatusLabel}>{t('HOME_SyncStoreSetupCheck', 'Store setup check')}</Text>
                                <Text style={styles.syncStatusValue}>{t('HOME_QueuedNext', 'Queued next')}</Text>
                            </View>
                            <View style={styles.syncStatusDivider} />
                            <View style={styles.syncStatusRow}>
                                <Text style={styles.syncStatusLabel}>{t('HOME_SyncDeviceAccess', 'Device access')}</Text>
                                <Text style={styles.syncStatusValue}>{t('HOME_Waiting', 'Waiting')}</Text>
                            </View>
                        </View>
                        <View style={styles.syncHintCard}>
                            <Text style={styles.syncHintTitle}>{t('HOME_NoActionNeeded', 'No action needed')}</Text>
                            <Text style={styles.syncHintText}>
                                {t(
                                    'HOME_NoActionNeededHint',
                                    'This is only a visual waiting state. Access appears automatically when sync completes.'
                                )}
                            </Text>
                        </View>
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
                    pendingOrderStatusLabel={t(
                        'HOME_OrderJournalPendingHint',
                        'Order journal entries stay on this device until you retry them manually.'
                    )}
                    onRemoveSavedLogin={removeSavedLogin}
                    onOpenAppDiagnostics={openAppDiagnostics}
                />
            ) : (
                <View testID="home-ready-shell" style={styles.readyShell}>
                    <View style={styles.readyHero}>
                        <Image source={brandMark} style={styles.readyBrandMark} resizeMode="contain" />
                        <Text style={styles.businessLabel}>{businessName || t('HOME_BusinessWorkspace', 'Business workspace')}</Text>
                        <Text style={styles.readyTitle}>{t('HOME_ChooseWorkspaceTitle', 'Choose your workspace')}</Text>
                        <Text style={styles.readySubtitle}>
                            {t(
                                'HOME_ChooseWorkspaceSubtitle',
                                'Jump into the live operational area that matches your role on this shared device.'
                            )}
                        </Text>
                        <View style={styles.readyMetaRow}>
                            <View style={styles.readyMetaChip}>
                                <Text style={styles.readyMetaLabel}>{t('HOME_EmployeeLabel', 'Employee')}</Text>
                                <Text style={styles.readyMetaValue}>
                                    {`${employee?.firstName || ''} ${employee?.lastName || ''}`.trim() || t('HOME_SignedIn', 'Signed in')}
                                </Text>
                            </View>
                            <View style={styles.readyMetaChip}>
                                <Text style={styles.readyMetaLabel}>{t('HOME_RolesLabel', 'Roles')}</Text>
                                <Text style={styles.readyMetaValue}>
                                    {t(
                                        'HOME_WorkspaceCount',
                                        `${visiblePaths.length} workspace${visiblePaths.length === 1 ? '' : 's'}`,
                                        { count: visiblePaths.length }
                                    )}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.readyRoutesPanel}>
                        <Text style={styles.readyRoutesEyebrow}>{t('HOME_AvailableAreas', 'Available areas')}</Text>
                        <HomeRouteGrid
                            paths={visiblePaths}
                            routeAnimations={routeAnimations}
                            styles={styles}
                            onGoTo={goto}
                            pendingPath={pendingRoutePath}
                        />
                    </View>
                </View>
            )}
        </ScrollView>
    );
};
