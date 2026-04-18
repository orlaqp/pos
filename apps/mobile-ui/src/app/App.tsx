/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, Button, Dialog, Text } from '@rneui/themed';
import { designTokens, theme } from '@pos/theme/native';
import { Provider, useSelector } from 'react-redux';
import { store, RootState, useAppDispatch } from '@pos/store';
import { logSyncDebug, startSyncMeasure } from '@pos/shared/utils';
import Navigation from './navigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppErrorBoundary } from './app-error-boundary';
import {
    Alert,
    AppState,
    Image,
    InteractionManager,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { UISpinner } from '@pos/shared/ui-native';
import {
    fetchDeviceSettings,
    fetchGlobalSettings,
    fetchStationInfo,
    ensureGlobalSettingsSyncHealthy,
    selectSettings,
    subscribeToGlobalSettingsChanges,
} from '@pos/settings/data-access';
import {
    ensureCategorySyncHealthy,
    subscribeToCategoryChanges,
} from '@pos/categories/data-access';
import {
    ensureBrandSyncHealthy,
    subscribeToBrandChanges,
} from '@pos/brands/data-access';
import {
    ensureEmployeeSyncHealthy,
    EmployeeService,
    fetchEmployees,
    employeesActions,
    subscribeToEmployeeChanges,
} from '@pos/employees/data-access';
import { fetchStoreInfo } from '@pos/store-info/data-access';
import {
    ensureUnitOfMeasureSyncHealthy,
    subscribeToUnitOfMeasureChanges,
} from '@pos/unit-of-measures/data-access';
import {
    fetchDefaultPrinter,
    ReceiptPreviewPayload,
    registerReceiptPreviewHandler,
} from '@pos/printings/data-access';
import {
    ensureProductSyncHealthy,
    subscribeToProductChanges,
} from '@pos/products/data-access';
import { ensureOrderSyncHealthy } from '@pos/orders/data-access';
import { selectCart } from '@pos/sales/data-access';
import brandMark from '../../assets/branding/pos-icon-transparent-2048.png';
import {
    authActions,
    bootstrapTenantSession,
    classifyAuthSessionError,
    clearCurrentTenantContext,
    getRememberedAdminCredentials,
    restoreSession,
    selectAuthRestoreStatus,
    setCurrentTenantContext,
    signIn,
    tenantSessionActions,
    User,
} from '@pos/auth/data-access';
import {
    configureDataStore,
    selectNetworkActive,
    selectOutboxEmpty,
} from '@pos/shared/data-store';
import {
    Auth,
    DataStore,
    getDataStoreLifecycleState,
    setDataStoreUnauthorizedHandler,
} from '@pos/shared/amplify';
import { E2EControlPanel } from './e2e-control-panel';
import {
    clearManualSignOut,
    markManualSignOut,
    readManualSignOut,
} from './session-signout';
import {
    beginAppLifecycleSession,
    recordAppLifecycleEvent,
} from './app-lifecycle-diagnostics';
import { shouldValidateSessionOnForeground } from './foreground-session-guard';
import { markAppInstallSeen } from './install-state';
import amplifyConfig from '../amplifyconfiguration.json';

type BootstrapStatus = 'idle' | 'checking-session' | 'resolving-tenant' | 'preparing-business-data' | 'ready' | 'error';
type SessionRecoveryState =
    | 'healthy'
    | 'refreshing'
    | 'needs_reauth'
    | 'reauth_in_progress'
    | 'deferred_until_sale_complete';
const appTheme = theme('dark');
const appColors = designTokens.colors;
const LAST_BOOTSTRAPPED_TENANT_KEY = 'last-bootstrapped-tenant-id-v1';
const LAST_BOOTSTRAPPED_CONTEXT_KEY = 'last-bootstrapped-context-v2';
const FOREGROUND_SESSION_CHECK_THROTTLE_MS = 5 * 60_000;
const SYNC_WATCHDOG_INTERVAL_MS = 15_000;

type BootstrappedDataStoreContext = {
    tenantId: string;
    graphqlEndpoint: string;
};

const isUnauthorizedError = (error: unknown) => {
    const message =
        error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : JSON.stringify(error);

    return message.includes('Unauthorized');
};

const logBootstrapStageError = (stage: string, error: unknown) => {
    console.error(`App bootstrap failed during ${stage}`, error);
};

const withTimeout = <T,>(
    label: string,
    promise: Promise<T>,
    ms = 10000
) =>
    Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(
                () => reject(new Error(`${label} timed out after ${ms}ms`)),
                ms
            )
        ),
    ]);

const getLastBootstrappedTenantId = async () => {
    try {
        return await AsyncStorage.getItem(LAST_BOOTSTRAPPED_TENANT_KEY);
    } catch {
        return null;
    }
};

const getCurrentGraphqlEndpoint = () =>
    String(
        (amplifyConfig as { aws_appsync_graphqlEndpoint?: string })
            .aws_appsync_graphqlEndpoint || ''
    );

const getLastBootstrappedContext = async (): Promise<BootstrappedDataStoreContext | null> => {
    try {
        const value = await AsyncStorage.getItem(LAST_BOOTSTRAPPED_CONTEXT_KEY);
        if (!value) {
            return null;
        }

        const parsed = JSON.parse(value) as Partial<BootstrappedDataStoreContext>;
        if (!parsed?.tenantId) {
            return null;
        }

        return {
            tenantId: String(parsed.tenantId),
            graphqlEndpoint: String(parsed.graphqlEndpoint || ''),
        };
    } catch {
        return null;
    }
};

const setLastBootstrappedTenantId = async (tenantId: string) => {
    try {
        await AsyncStorage.setItem(LAST_BOOTSTRAPPED_TENANT_KEY, tenantId);
    } catch {
        // Best-effort cache marker; bootstrap should continue even if this fails.
    }
};

const setLastBootstrappedContext = async (
    context: BootstrappedDataStoreContext
) => {
    try {
        await AsyncStorage.setItem(
            LAST_BOOTSTRAPPED_CONTEXT_KEY,
            JSON.stringify(context)
        );
    } catch {
        // Best-effort cache marker; bootstrap should continue even if this fails.
    }
};

const clearLastBootstrappedTenantId = async () => {
    try {
        await AsyncStorage.removeItem(LAST_BOOTSTRAPPED_TENANT_KEY);
        await AsyncStorage.removeItem(LAST_BOOTSTRAPPED_CONTEXT_KEY);
    } catch {
        // Best-effort cache marker.
    }
};

const StartupScreen = ({
    status,
    onRetry,
    onSignOut,
    errorMessage,
}: {
    status: Exclude<BootstrapStatus, 'ready'>;
    onRetry: () => void;
    onSignOut: () => void;
    errorMessage?: string;
}) => {
    const styles = useStartupStyles();
    const isError = status === 'error';
    const messageByStatus: Record<Exclude<BootstrapStatus, 'ready' | 'error'>, string> = {
        idle: 'Starting...',
        'checking-session': 'Restoring business admin session...',
        'resolving-tenant': 'Resolving business workspace...',
        'preparing-business-data': 'Loading employees and tenant data...',
    };

    return (
        <View style={styles.container} testID="app-startup-screen">
            <Image source={brandMark} style={styles.logo} resizeMode="contain" />
            {isError ? (
                <>
                    <Text h3 style={styles.title} testID="app-startup-title">Startup failed</Text>
                    <Text style={styles.message}>
                        The app could not restore the business workspace. Retry the startup sequence.
                    </Text>
                    {errorMessage ? (
                        <Text style={styles.errorDetail}>{errorMessage}</Text>
                    ) : null}
                    <View style={styles.errorActions}>
                        <Button
                            title="Retry"
                            onPress={onRetry}
                            buttonStyle={styles.retryButton}
                        />
                        <Button
                            title="Sign Out"
                            type="outline"
                            onPress={onSignOut}
                            buttonStyle={styles.signOutButton}
                            titleStyle={styles.signOutButtonTitle}
                        />
                    </View>
                </>
            ) : (
                <>
                    <Text h3 style={styles.title} testID="app-startup-title">Preparing POS</Text>
                    <UISpinner size="large" message={messageByStatus[status]} />
                    <Text testID="app-startup-status" style={styles.message}>
                        {messageByStatus[status]}
                    </Text>
                </>
            )}
        </View>
    );
};

const AppContent = () => {
    const startupStyles = useStartupStyles();
    const dispatch = useAppDispatch();
    const authUser = useSelector((state: RootState) => state.auth.user);
    const authError = useSelector((state: RootState) => state.auth.error);
    const authRestoreStatus = useSelector(selectAuthRestoreStatus);
    const networkActive = useSelector(selectNetworkActive);
    const outboxEmpty = useSelector(selectOutboxEmpty);
    const settings = useSelector(selectSettings);
    const tenantSession = useSelector((state: RootState) => state.tenantSession);
    const cart = useSelector(selectCart);
    const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus>('idle');
    const [bootstrapError, setBootstrapError] = useState<string>();
    const [sessionRecoveryState, setSessionRecoveryState] =
        useState<SessionRecoveryState>('healthy');
    const [receiptPreviewState, setReceiptPreviewState] = useState<{
        items: ReceiptPreviewPayload[];
        activeIndex: number;
    }>({
        items: [],
        activeIndex: 0,
    });
    const bootstrapInFlightRef = useRef<Promise<void> | null>(null);
    const lastBootstrapTriggerRef = useRef<string | null>(null);
    const startBootstrapRef = useRef<(() => Promise<void> | undefined) | null>(null);
    const sessionExpiryAlertShownRef = useRef(false);
    const sessionValidationInFlightRef = useRef<Promise<void> | null>(null);
    const silentReauthInFlightRef = useRef<Promise<User | null> | null>(null);
    const lastForegroundSessionCheckAtRef = useRef(0);
    const lastKnownAppStateRef = useRef(AppState.currentState);
    const foregroundValidationTaskRef = useRef<{ cancel?: () => void } | null>(
        null
    );
    const deferredBusinessRefreshRef = useRef<{ cancel?: () => void } | null>(
        null
    );
    const hasActiveSale = (cart.items?.length || 0) > 0;
    const recordLifecycleEvent = useCallback(
        (name: string, details?: Record<string, unknown>) => {
            void recordAppLifecycleEvent(name, details);
        },
        []
    );

    useEffect(() => {
        void beginAppLifecycleSession();
    }, []);

    useEffect(() => {
        recordLifecycleEvent('appstate.initial', {
            currentState: AppState.currentState,
        });
    }, [recordLifecycleEvent]);

    useEffect(() => {
        return () => {
            deferredBusinessRefreshRef.current?.cancel?.();
            deferredBusinessRefreshRef.current = null;
            foregroundValidationTaskRef.current?.cancel?.();
            foregroundValidationTaskRef.current = null;
        };
    }, []);

    useEffect(() => {
        return registerReceiptPreviewHandler((payload) => {
            setReceiptPreviewState((current) => ({
                items: [...current.items, payload],
                activeIndex: current.items.length === 0 ? 0 : current.activeIndex,
            }));
        });
    }, []);

    const refreshBusinessContext = useCallback(async () => {
        const finishBusinessData = startSyncMeasure(
            'app-bootstrap',
            'business-data.fetches'
        );
        const businessDataResults = await Promise.allSettled([
            dispatch(fetchStoreInfo()).unwrap(),
            dispatch(fetchDeviceSettings()).unwrap(),
            dispatch(fetchGlobalSettings()).unwrap(),
            dispatch(fetchDefaultPrinter()).unwrap(),
        ]);
        finishBusinessData({
            storeInfo: businessDataResults[0].status,
            deviceSettings: businessDataResults[1].status,
            globalSettings: businessDataResults[2].status,
            defaultPrinter: businessDataResults[3].status,
        });

        const stageLabels = [
            'fetchStoreInfo()',
            'fetchDeviceSettings()',
            'fetchGlobalSettings()',
            'fetchDefaultPrinter()',
        ];

        businessDataResults.forEach((result, index) => {
            if (result.status === 'rejected') {
                logBootstrapStageError(stageLabels[index], result.reason);
            }
        });
    }, [dispatch]);

    const resetSessionState = useCallback(async (options?: { manual?: boolean; destructive?: boolean }) => {
        recordLifecycleEvent('session.reset:start', {
            manual: options?.manual ?? true,
            destructive: options?.destructive ?? false,
        });
        try {
            if (options?.manual ?? true) {
                await markManualSignOut();
            } else {
                await clearManualSignOut();
            }
            await DataStore.stop();
            if (options?.destructive ?? false) {
                await DataStore.clear();
            }
        } finally {
            clearCurrentTenantContext();
            dispatch(authActions.logoff());
            dispatch(tenantSessionActions.clearTenantSession());
            dispatch(employeesActions.logoffEmployee());
            await clearLastBootstrappedTenantId();
            recordLifecycleEvent('session.reset:complete', {
                manual: options?.manual ?? true,
                destructive: options?.destructive ?? false,
            });
        }
    }, [dispatch, recordLifecycleEvent]);

    const attemptSilentReauth = useCallback(async () => {
        if (silentReauthInFlightRef.current) {
            return silentReauthInFlightRef.current;
        }

        const reauthPromise = (async () => {
            const remembered = await getRememberedAdminCredentials();
            if (!remembered) {
                return null;
            }

            setSessionRecoveryState('reauth_in_progress');

            try {
                const restoredUser = await dispatch(
                    signIn({
                        email: remembered.username,
                        password: remembered.password,
                    })
                ).unwrap();

                await clearManualSignOut();
                setBootstrapError(undefined);
                setSessionRecoveryState('healthy');
                recordLifecycleEvent('session.reauth:success', {
                    tenantId: restoredUser.tenantId,
                });
                return restoredUser;
            } catch (error) {
                console.error('Silent admin re-login failed', error);
                setSessionRecoveryState('needs_reauth');
                recordLifecycleEvent('session.reauth:failed', {
                    message:
                        error instanceof Error ? error.message : String(error),
                });
                return null;
            }
        })();

        silentReauthInFlightRef.current = reauthPromise;

        try {
            return await reauthPromise;
        } finally {
            if (silentReauthInFlightRef.current === reauthPromise) {
                silentReauthInFlightRef.current = null;
            }
        }
    }, [dispatch, recordLifecycleEvent]);

    const handleExpiredSession = useCallback(
        async (message?: string) => {
            recordLifecycleEvent('session.expired:detected', {
                hasActiveSale,
                message: message || 'unknown',
            });
            const restoredUser = await attemptSilentReauth();
            if (restoredUser) {
                return;
            }

            if (hasActiveSale) {
                setSessionRecoveryState('deferred_until_sale_complete');

                if (!sessionExpiryAlertShownRef.current) {
                    sessionExpiryAlertShownRef.current = true;
                    Alert.alert(
                        'Admin login expired',
                        'This sale is safe to finish. Sign in again after checkout to restore syncing and admin access.',
                        [
                            {
                                text: 'OK',
                                onPress: () => {
                                    sessionExpiryAlertShownRef.current = false;
                                },
                            },
                        ]
                    );
                }

                setBootstrapError(message);
                return;
            }

            if (!sessionExpiryAlertShownRef.current) {
                sessionExpiryAlertShownRef.current = true;
                Alert.alert(
                    'Session expired',
                    'Your admin login expired. Please sign in again to continue.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                sessionExpiryAlertShownRef.current = false;
                            },
                        },
                    ]
                );
            }

            setSessionRecoveryState('needs_reauth');
            setBootstrapError(message);
            await resetSessionState({ manual: false });
            setBootstrapStatus('ready');
        },
        [attemptSilentReauth, hasActiveSale, recordLifecycleEvent, resetSessionState]
    );

    useEffect(() => {
        setDataStoreUnauthorizedHandler(async ({ source, error }) => {
            const message =
                error instanceof Error
                    ? error.message
                    : typeof error === 'string'
                      ? error
                      : JSON.stringify(error);

            recordLifecycleEvent('datastore.unauthorized', {
                source,
                message,
            });

            const restoredUser = await attemptSilentReauth();
            if (restoredUser) {
                setBootstrapError(undefined);
                setSessionRecoveryState('healthy');

                try {
                    await DataStore.stop();
                    await DataStore.clear();
                } catch (recoveryError) {
                    console.error(
                        'DataStore unauthorized recovery reset failed',
                        recoveryError
                    );
                }

                lastBootstrapTriggerRef.current = null;
                setBootstrapStatus('idle');
                void startBootstrapRef.current?.();
                return;
            }

            await resetSessionState({ manual: false, destructive: true });
            setSessionRecoveryState('needs_reauth');
            setBootstrapError(message);
            setBootstrapStatus('ready');
        });

        return () => {
            setDataStoreUnauthorizedHandler(undefined);
        };
    }, [attemptSilentReauth, recordLifecycleEvent, resetSessionState]);

    const startBootstrap = useCallback(async () => {
        if (bootstrapInFlightRef.current) {
            logSyncDebug('app-bootstrap', 'startup:skip-inflight');
            return bootstrapInFlightRef.current;
        }

        const currentTenantId = tenantSession.currentTenantId;
        if (
            bootstrapStatus === 'ready' &&
            !bootstrapError &&
            authUser?.tenantId &&
            currentTenantId === authUser.tenantId &&
            tenantSession.bootstrapStatus === 'ready'
        ) {
            logSyncDebug('app-bootstrap', 'startup:skip-ready', {
                tenantId: authUser.tenantId,
            });
            return;
        }

        const bootstrapPromise = (async () => {
        recordLifecycleEvent('bootstrap:start', {
            hasAuthUser: Boolean(authUser),
        });
        if (process.env.NODE_ENV === 'test') {
            setBootstrapStatus('ready');
            return;
        }

        setBootstrapError(undefined);
        setBootstrapStatus('checking-session');
        const finishBootstrap = startSyncMeasure('app-bootstrap', 'startup');

        try {
            let user = authUser;

            if (!user) {
                const firstLaunchAfterInstall = await markAppInstallSeen();

                if (firstLaunchAfterInstall) {
                    recordLifecycleEvent('install.firstLaunchDetected');
                    await clearManualSignOut();

                    try {
                        await Auth.signOut('local');
                    } catch (error) {
                        console.warn('First-launch local sign out skipped', error);
                    }

                    try {
                        await DataStore.stop();
                        await DataStore.clear();
                    } catch (error) {
                        console.warn('First-launch DataStore reset skipped', error);
                    }

                    clearCurrentTenantContext();
                    dispatch(authActions.logoff());
                    dispatch(tenantSessionActions.clearTenantSession());
                    dispatch(employeesActions.logoffEmployee());
                    await clearLastBootstrappedTenantId();
                }

                const manuallySignedOut = await readManualSignOut();

                if (manuallySignedOut) {
                    clearCurrentTenantContext();
                    dispatch(authActions.logoff());
                    dispatch(tenantSessionActions.clearTenantSession());
                    dispatch(employeesActions.logoffEmployee());
                    setBootstrapStatus('ready');
                    return;
                }

                try {
                    user = await dispatch(restoreSession()).unwrap();
                } catch (error) {
                    const recoveredUser = await attemptSilentReauth();
                    if (recoveredUser) {
                        user = recoveredUser;
                    } else if (error === 'NO_SESSION' || ['no_session', 'revoked', 'expired'].includes(classifyAuthSessionError(error))) {
                        const previousTenantId = await getLastBootstrappedTenantId();
                        clearCurrentTenantContext();
                        dispatch(authActions.logoff());
                        dispatch(tenantSessionActions.clearTenantSession());
                        dispatch(employeesActions.logoffEmployee());
                        void clearLastBootstrappedTenantId();
                        if (previousTenantId) {
                            Alert.alert(
                                'Session expired',
                                'Your admin login expired. Please sign in again to continue. If you enable saved login on this device, the app can recover it automatically next time.'
                            );
                        }
                        setSessionRecoveryState('needs_reauth');
                        setBootstrapStatus('ready');
                        return;
                    } else {
                        throw error;
                    }
                }
            }

            if (!user) {
                clearCurrentTenantContext();
                dispatch(authActions.logoff());
                dispatch(tenantSessionActions.clearTenantSession());
                dispatch(employeesActions.logoffEmployee());
                void clearLastBootstrappedTenantId();
                setBootstrapStatus('ready');
                return;
            }

            await clearManualSignOut();
            setSessionRecoveryState('healthy');

            setBootstrapStatus('resolving-tenant');
            logSyncDebug('app-bootstrap', 'tenant:resolved', {
                tenantId: user.tenantId,
                businessName: user.businessName,
            });
            dispatch(
                tenantSessionActions.setTenantSession({
                    tenantId: user.tenantId,
                    businessName: user.businessName,
                })
            );
            setCurrentTenantContext({
                tenantId: user.tenantId,
                businessName: user.businessName,
            });
            dispatch(tenantSessionActions.setBootstrapStatus('restoring'));

            const finishStop = startSyncMeasure('app-bootstrap', 'datastore.stop');
            await DataStore.stop();
            finishStop();
            const currentGraphqlEndpoint = getCurrentGraphqlEndpoint();
            const lastTenantId = await getLastBootstrappedTenantId();
            const lastBootstrappedContext = await getLastBootstrappedContext();
            const shouldClearDataStore = lastBootstrappedContext
                ? lastBootstrappedContext.tenantId !== user.tenantId ||
                  lastBootstrappedContext.graphqlEndpoint !== currentGraphqlEndpoint
                : !!lastTenantId && lastTenantId !== user.tenantId;
            logSyncDebug('app-bootstrap', 'tenant-cache:state', {
                lastTenantId,
                lastBootstrappedContext,
                currentTenantId: user.tenantId,
                currentGraphqlEndpoint,
                shouldClearDataStore,
            });

            if (shouldClearDataStore) {
                const finishClear = startSyncMeasure('app-bootstrap', 'datastore.clear');
                await DataStore.clear();
                finishClear();
            }

            const finishConfigure = startSyncMeasure('app-bootstrap', 'datastore.configure');
            configureDataStore();
            finishConfigure();
            void bootstrapTenantSession(user).catch((error) => {
                logBootstrapStageError('bootstrapTenantSession()', error);
            });

            try {
                const finishStart = startSyncMeasure('app-bootstrap', 'datastore.start');
                await DataStore.start();
                finishStart();
            } catch (error) {
                logBootstrapStageError('DataStore.start()', error);
                if (!isUnauthorizedError(error)) {
                    throw error;
                }
            }
            await setLastBootstrappedTenantId(user.tenantId);
            await setLastBootstrappedContext({
                tenantId: user.tenantId,
                graphqlEndpoint: currentGraphqlEndpoint,
            });

            setBootstrapStatus('preparing-business-data');
            dispatch(tenantSessionActions.setBootstrapStatus('bootstrapping'));

            try {
                const finishStation = startSyncMeasure('app-bootstrap', 'fetchStationInfo');
                await withTimeout(
                    'fetchStationInfo()',
                    dispatch(fetchStationInfo()).unwrap()
                );
                finishStation();
            } catch (error) {
                logBootstrapStageError('fetchStationInfo()', error);
            }

            const finishEmployees = startSyncMeasure('app-bootstrap', 'fetchEmployees');
            await dispatch(fetchEmployees()).unwrap();
            finishEmployees();

            try {
                const localEmployeesAfterSync = await EmployeeService.getLocalEmployees();
                logSyncDebug('app-bootstrap', 'employees:local-after-sync', {
                    itemCount: localEmployeesAfterSync.length,
                    sample: localEmployeesAfterSync.slice(0, 5).map((employee) => ({
                        id: employee.id,
                        tenantId: employee.tenantId,
                        email: employee.email,
                        active: employee.active,
                    })),
                });
            } catch (error) {
                logBootstrapStageError('EmployeeService.getLocalEmployees()', error);
            }

            dispatch(tenantSessionActions.setBootstrapStatus('ready'));
            setBootstrapStatus('ready');
            recordLifecycleEvent('bootstrap:ready', {
                tenantId: user.tenantId,
            });
            finishBootstrap({
                result: 'ready',
            });
            deferredBusinessRefreshRef.current?.cancel?.();
            deferredBusinessRefreshRef.current =
                InteractionManager.runAfterInteractions(() => {
                    void refreshBusinessContext();
                });
        } catch (error) {
            console.error('App bootstrap failed', error);
            const message =
                typeof error === 'string'
                    ? error
                    : error instanceof Error
                      ? error.message
                      : error && typeof error === 'object' && 'message' in error
                        ? String((error as { message?: unknown }).message)
                        : 'Bootstrap failed with an unknown error';
            dispatch(tenantSessionActions.setTenantSessionError(message));
            setBootstrapError(message);
            setBootstrapStatus('error');
            recordLifecycleEvent('bootstrap:error', { message });
            finishBootstrap({
                result: 'error',
                message,
            });
        }
        })();

        bootstrapInFlightRef.current = bootstrapPromise;
        bootstrapPromise.finally(() => {
            if (bootstrapInFlightRef.current === bootstrapPromise) {
                bootstrapInFlightRef.current = null;
            }
        });

        return bootstrapPromise;
    }, [
        attemptSilentReauth,
        authUser,
        bootstrapError,
        bootstrapStatus,
        dispatch,
        recordLifecycleEvent,
        refreshBusinessContext,
        tenantSession.bootstrapStatus,
        tenantSession.currentTenantId,
    ]);

    useEffect(() => {
        startBootstrapRef.current = startBootstrap;
    }, [startBootstrap]);

    const signOutFromStartup = useCallback(async () => {
        setBootstrapError(undefined);
        recordLifecycleEvent('startup.signout:start');

        try {
            await Auth.signOut('local');
        } catch (error) {
            console.error('Startup sign out failed', error);
        } finally {
            await resetSessionState();
            setSessionRecoveryState('healthy');
            setBootstrapStatus('ready');
            recordLifecycleEvent('startup.signout:complete');
        }
    }, [recordLifecycleEvent, resetSessionState]);

    useEffect(() => {
        const bootstrapTriggerKey = authUser?.tenantId ?? 'signed-out';

        if (lastBootstrapTriggerRef.current === bootstrapTriggerKey) {
            return;
        }

        lastBootstrapTriggerRef.current = bootstrapTriggerKey;
        void startBootstrapRef.current?.();
    }, [authUser?.tenantId]);

    const authTenantId = authUser?.tenantId;

    useEffect(() => {
        if (
            !authTenantId ||
            !tenantSession.currentTenantId ||
            bootstrapStatus !== 'ready' ||
            settings.dataStoreStatus === 'resetting'
        ) {
            return;
        }

        let isCancelled = false;
        let employeesSub: { unsubscribe: () => void } | undefined;

        logSyncDebug('app-employees', 'subscribe:start', {
            tenantId: tenantSession.currentTenantId,
            bootstrapStatus,
        });

        const interaction = InteractionManager.runAfterInteractions(() => {
            if (isCancelled) {
                return;
            }

            employeesSub = subscribeToEmployeeChanges(
                dispatch,
                tenantSession.currentTenantId
            );
        });

        return () => {
            isCancelled = true;
            logSyncDebug('app-employees', 'subscribe:stop', {
                tenantId: tenantSession.currentTenantId,
                bootstrapStatus,
            });
            interaction.cancel();
            employeesSub?.unsubscribe();
        };
    }, [authTenantId, bootstrapStatus, dispatch, settings.dataStoreStatus, tenantSession.currentTenantId]);

    useEffect(() => {
        if (
            !authTenantId ||
            !tenantSession.currentTenantId ||
            bootstrapStatus !== 'ready' ||
            settings.dataStoreStatus === 'resetting'
        ) {
            return;
        }

        let isCancelled = false;
        let categoriesSub: { unsubscribe: () => void } | undefined;
        let brandsSub: { unsubscribe: () => void } | undefined;
        let unitOfMeasuresSub: { unsubscribe: () => void } | undefined;
        let globalSettingsSub: { unsubscribe: () => void } | undefined;

        logSyncDebug('app-reference-data', 'subscribe:start', {
            tenantId: tenantSession.currentTenantId,
            bootstrapStatus,
        });

        const interaction = InteractionManager.runAfterInteractions(() => {
            if (isCancelled) {
                return;
            }

            categoriesSub = subscribeToCategoryChanges(
                dispatch,
                tenantSession.currentTenantId
            );
            brandsSub = subscribeToBrandChanges(
                dispatch,
                tenantSession.currentTenantId
            );
            unitOfMeasuresSub = subscribeToUnitOfMeasureChanges(
                dispatch,
                tenantSession.currentTenantId
            );
            globalSettingsSub = subscribeToGlobalSettingsChanges(
                dispatch,
                tenantSession.currentTenantId
            );
        });

        return () => {
            isCancelled = true;
            logSyncDebug('app-reference-data', 'subscribe:stop', {
                tenantId: tenantSession.currentTenantId,
                bootstrapStatus,
            });
            interaction.cancel();
            categoriesSub?.unsubscribe();
            brandsSub?.unsubscribe();
            unitOfMeasuresSub?.unsubscribe();
            globalSettingsSub?.unsubscribe();
        };
    }, [
        authTenantId,
        bootstrapStatus,
        dispatch,
        settings.dataStoreStatus,
        tenantSession.currentTenantId,
    ]);

    useEffect(() => {
        if (
            !authTenantId ||
            !tenantSession.currentTenantId ||
            bootstrapStatus !== 'ready' ||
            settings.dataStoreStatus === 'resetting'
        ) {
            return;
        }

        let isCancelled = false;
        let productsSub: { unsubscribe: () => void } | undefined;

        logSyncDebug('app-products', 'subscribe:start', {
            tenantId: tenantSession.currentTenantId,
            bootstrapStatus,
        });

        if (!isCancelled) {
            productsSub = subscribeToProductChanges(
                dispatch,
                tenantSession.currentTenantId
            );
        }

        return () => {
            isCancelled = true;
            logSyncDebug('app-products', 'subscribe:stop', {
                tenantId: tenantSession.currentTenantId,
                bootstrapStatus,
            });
            productsSub?.unsubscribe();
        };
    }, [authTenantId, bootstrapStatus, dispatch, settings.dataStoreStatus, tenantSession.currentTenantId]);

    useEffect(() => {
        const tenantId = tenantSession.currentTenantId;
        if (
            AppState.currentState !== 'active' ||
            !authTenantId ||
            !tenantId ||
            bootstrapStatus !== 'ready' ||
            tenantSession.bootstrapStatus !== 'ready' ||
            settings.dataStoreStatus === 'resetting'
        ) {
            return;
        }

        let isCancelled = false;

        const runWatchdog = async () => {
            if (
                isCancelled ||
                AppState.currentState !== 'active' ||
                bootstrapInFlightRef.current ||
                silentReauthInFlightRef.current ||
                sessionValidationInFlightRef.current
            ) {
                return;
            }

            const lifecycleState = getDataStoreLifecycleState();
            if (lifecycleState === 'starting' || lifecycleState === 'stopping') {
                return;
            }

            try {
                await ensureEmployeeSyncHealthy(dispatch, { tenantId });
                await ensureProductSyncHealthy(dispatch, { tenantId });
                await ensureCategorySyncHealthy(dispatch, { tenantId });
                await ensureBrandSyncHealthy(dispatch, { tenantId });
                await ensureUnitOfMeasureSyncHealthy(dispatch, { tenantId });
                await ensureGlobalSettingsSyncHealthy(dispatch, { tenantId });
                await ensureOrderSyncHealthy(dispatch, { tenantId });
            } catch (error) {
                console.error('[sync.watchdog] health check failed', error);
                recordLifecycleEvent('sync.watchdog:error', {
                    tenantId,
                    message:
                        error instanceof Error ? error.message : String(error),
                    networkActive,
                    outboxEmpty,
                    lifecycleState,
                });
            }
        };

        void runWatchdog();
        const interval = setInterval(() => {
            void runWatchdog();
        }, SYNC_WATCHDOG_INTERVAL_MS);

        return () => {
            isCancelled = true;
            clearInterval(interval);
        };
    }, [
        authTenantId,
        bootstrapStatus,
        dispatch,
        networkActive,
        outboxEmpty,
        recordLifecycleEvent,
        settings.dataStoreStatus,
        tenantSession.bootstrapStatus,
        tenantSession.currentTenantId,
    ]);

    useEffect(() => {
        if (!authUser) {
            sessionExpiryAlertShownRef.current = false;
            setSessionRecoveryState('healthy');
            return;
        }

        const subscription = AppState.addEventListener('change', async (nextState) => {
            const previousState = lastKnownAppStateRef.current;
            lastKnownAppStateRef.current = nextState;
            recordLifecycleEvent('appstate.change', {
                previousState,
                nextState,
            });
            if (nextState !== 'active') {
                foregroundValidationTaskRef.current?.cancel?.();
                foregroundValidationTaskRef.current = null;
                return;
            }

            const now = Date.now();
            if (
                !shouldValidateSessionOnForeground({
                    previousState,
                    nextState,
                    now,
                    lastForegroundSessionCheckAt: lastForegroundSessionCheckAtRef.current,
                    throttleMs: FOREGROUND_SESSION_CHECK_THROTTLE_MS,
                    bootstrapStatus,
                    sessionRecoveryState,
                    hasAuthUser: Boolean(authUser),
                    hasValidationInFlight: Boolean(
                        sessionValidationInFlightRef.current
                    ),
                    hasValidationScheduled: Boolean(
                        foregroundValidationTaskRef.current
                    ),
                    hasBootstrapInFlight: Boolean(bootstrapInFlightRef.current),
                    hasSilentReauthInFlight: Boolean(
                        silentReauthInFlightRef.current
                    ),
                })
            ) {
                return;
            }

            lastForegroundSessionCheckAtRef.current = now;
            foregroundValidationTaskRef.current = InteractionManager.runAfterInteractions(
                () => {
                    foregroundValidationTaskRef.current = null;

                    if (
                        AppState.currentState !== 'active' ||
                        sessionValidationInFlightRef.current ||
                        bootstrapInFlightRef.current ||
                        silentReauthInFlightRef.current
                    ) {
                        return;
                    }

                    const validationPromise = (async () => {
                        try {
                            // Do not force-refresh on every foreground transition.
                            // fetchAuthSession() will use the current session and only refresh if needed.
                            setSessionRecoveryState('refreshing');
                            await Auth.fetchSession();
                            setSessionRecoveryState('healthy');
                            recordLifecycleEvent('session.validation:success');
                        } catch (error) {
                            const sessionIssue = classifyAuthSessionError(error);
                            recordLifecycleEvent('session.validation:failed', {
                                sessionIssue,
                                message:
                                    error instanceof Error ? error.message : String(error),
                            });
                            if (
                                sessionIssue !== 'no_session' &&
                                sessionIssue !== 'revoked' &&
                                sessionIssue !== 'expired'
                            ) {
                                console.error('Session validation failed', error);
                                setSessionRecoveryState(
                                    sessionIssue === 'transient' ? 'refreshing' : 'healthy'
                                );
                                return;
                            }

                            await handleExpiredSession(
                                error instanceof Error ? error.message : String(error)
                            );
                        }
                    })();

                    sessionValidationInFlightRef.current = validationPromise;

                    void validationPromise.finally(() => {
                        if (sessionValidationInFlightRef.current === validationPromise) {
                            sessionValidationInFlightRef.current = null;
                        }
                    });
                }
            );
        });

        return () => {
            foregroundValidationTaskRef.current?.cancel?.();
            foregroundValidationTaskRef.current = null;
            subscription.remove();
        };
    }, [
        authUser,
        bootstrapStatus,
        handleExpiredSession,
        recordLifecycleEvent,
        sessionRecoveryState,
    ]);

    useEffect(() => {
        const subscription = AppState.addEventListener('memoryWarning', () => {
            recordLifecycleEvent('appstate.memoryWarning');
        });

        return () => {
            subscription.remove();
        };
    }, [recordLifecycleEvent]);

    useEffect(() => {
        if (sessionRecoveryState !== 'deferred_until_sale_complete' || hasActiveSale) {
            return;
        }

        let isCancelled = false;

        const resolveDeferredReauth = async () => {
            const restoredUser = await attemptSilentReauth();
            if (restoredUser || isCancelled) {
                return;
            }

            Alert.alert(
                'Admin login required',
                'The sale finished safely. Please sign in again to continue syncing and business admin actions.'
            );
            await resetSessionState({ manual: false });
            if (!isCancelled) {
                setSessionRecoveryState('needs_reauth');
                setBootstrapStatus('ready');
            }
        };

        void resolveDeferredReauth();

        return () => {
            isCancelled = true;
        };
    }, [attemptSilentReauth, hasActiveSale, resetSessionState, sessionRecoveryState]);

    const visibleBootstrapError = useMemo(() => {
        return bootstrapError || tenantSession.error || authError || undefined;
    }, [authError, bootstrapError, tenantSession.error]);

    const shouldShowStartup =
        bootstrapStatus !== 'ready' ||
        authRestoreStatus === 'inProgress' ||
        tenantSession.bootstrapStatus === 'restoring' ||
        tenantSession.bootstrapStatus === 'bootstrapping';
    const activeReceiptPreview =
        receiptPreviewState.items[receiptPreviewState.activeIndex];

    if (shouldShowStartup) {
        return (
            <StartupScreen
                status={
                    bootstrapStatus === 'error'
                        ? 'error'
                        : bootstrapStatus === 'ready'
                          ? 'checking-session'
                          : bootstrapStatus === 'idle'
                            ? 'checking-session'
                            : bootstrapStatus
                }
                onRetry={startBootstrap}
                onSignOut={signOutFromStartup}
                errorMessage={visibleBootstrapError}
            />
        );
    }

    return (
        <>
            <NavigationContainer>
                <Navigation />
            </NavigationContainer>
            <Dialog
                isVisible={receiptPreviewState.items.length > 0}
                onBackdropPress={() =>
                    setReceiptPreviewState({ items: [], activeIndex: 0 })
                }
                supportedOrientations={['landscape']}
                presentationStyle="fullScreen"
                backdropStyle={startupStyles.receiptPreviewBackdrop}
                overlayStyle={startupStyles.receiptPreviewOverlay}
            >
                <View style={startupStyles.receiptPreviewHeader}>
                    <Text h4 style={startupStyles.receiptPreviewTitle}>
                        Receipt Preview
                    </Text>
                    <Text style={startupStyles.receiptPreviewHint}>
                        No printer is configured. This is the receipt that would be printed.
                    </Text>
                    {receiptPreviewState.items.length > 1 ? (
                        <Text style={startupStyles.receiptPreviewMeta}>
                            Copy {receiptPreviewState.activeIndex + 1} of{' '}
                            {receiptPreviewState.items.length}
                        </Text>
                    ) : null}
                </View>
                <View style={startupStyles.receiptPreviewChipRow}>
                    {activeReceiptPreview?.copyType ? (
                        <View style={startupStyles.receiptPreviewChip}>
                            <Text style={startupStyles.receiptPreviewChipText}>
                                {activeReceiptPreview.copyType}
                            </Text>
                        </View>
                    ) : null}
                    {activeReceiptPreview?.orderNo ? (
                        <View style={startupStyles.receiptPreviewChip}>
                            <Text style={startupStyles.receiptPreviewChipText}>
                                {activeReceiptPreview.orderNo}
                            </Text>
                        </View>
                    ) : null}
                </View>
                <ScrollView style={startupStyles.receiptPreviewScroll}>
                    <Text
                        selectable
                        style={startupStyles.receiptPreviewText}
                        testID="receipt-preview-text"
                    >
                        {activeReceiptPreview?.receiptText}
                    </Text>
                </ScrollView>
                <View style={startupStyles.receiptPreviewActions}>
                    <Button
                        type="clear"
                        title="Close"
                        onPress={() =>
                            setReceiptPreviewState({ items: [], activeIndex: 0 })
                        }
                    />
                    {receiptPreviewState.activeIndex > 0 ? (
                        <Button
                            type="outline"
                            title="Previous"
                            onPress={() =>
                                setReceiptPreviewState((current) => ({
                                    ...current,
                                    activeIndex: Math.max(0, current.activeIndex - 1),
                                }))
                            }
                        />
                    ) : null}
                    {receiptPreviewState.activeIndex <
                    receiptPreviewState.items.length - 1 ? (
                        <Button
                            title="Next"
                            onPress={() =>
                                setReceiptPreviewState((current) => ({
                                    ...current,
                                    activeIndex: Math.min(
                                        current.items.length - 1,
                                        current.activeIndex + 1
                                    ),
                                }))
                            }
                        />
                    ) : null}
                </View>
            </Dialog>
        </>
    );
};

export const App = () => {
    return (
        <AppErrorBoundary>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Provider store={store}>
                    <ThemeProvider theme={appTheme}>
                        <SafeAreaProvider>
                            <AppContent />
                            <E2EControlPanel />
                        </SafeAreaProvider>
                    </ThemeProvider>
                </Provider>
            </GestureHandlerRootView>
        </AppErrorBoundary>
    );
};

export default App;

const useStartupStyles = () =>
    StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
            backgroundColor: appColors.canvas,
        },
        logo: {
            width: 240,
            height: 140,
            marginBottom: 24,
        },
        title: {
            color: appColors.textPrimary,
            marginBottom: 12,
            textAlign: 'center',
        },
        message: {
            color: appColors.textSecondary,
            textAlign: 'center',
            maxWidth: 420,
            marginBottom: 20,
        },
        errorDetail: {
            color: appColors.textSecondary,
            textAlign: 'center',
            maxWidth: 520,
            marginBottom: 20,
            opacity: 0.85,
        },
        receiptPreviewOverlay: {
            width: '92%',
            maxWidth: 860,
            borderRadius: 20,
            padding: 20,
            backgroundColor: '#121821',
            borderWidth: 1,
            borderColor: '#263241',
            shadowColor: '#000000',
            shadowOpacity: 0.35,
            shadowRadius: 24,
            shadowOffset: {
                width: 0,
                height: 12,
            },
            elevation: 12,
        },
        receiptPreviewBackdrop: {
            backgroundColor: 'rgba(4, 8, 14, 0.78)',
        },
        receiptPreviewHeader: {
            marginBottom: 12,
        },
        receiptPreviewTitle: {
            color: appColors.textPrimary,
            marginBottom: 6,
        },
        receiptPreviewHint: {
            color: appColors.textSecondary,
            lineHeight: 20,
        },
        receiptPreviewMeta: {
            color: appColors.textSecondary,
            marginTop: 6,
            fontWeight: '700',
        },
        receiptPreviewChipRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: 12,
            gap: 8,
        },
        receiptPreviewChip: {
            borderWidth: 1,
            borderColor: `${appColors.accent}55`,
            backgroundColor: `${appColors.accent}18`,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 6,
        },
        receiptPreviewChipText: {
            color: appColors.textPrimary,
            fontWeight: '700',
        },
        receiptPreviewScroll: {
            maxHeight: 440,
            borderRadius: 14,
            backgroundColor: '#0f1217',
            paddingHorizontal: 14,
            paddingVertical: 12,
            marginBottom: 16,
        },
        receiptPreviewText: {
            color: '#f5f7fb',
            fontFamily: 'Courier',
            fontSize: 13,
            lineHeight: 20,
        },
        receiptPreviewActions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 10,
        },
        retryButton: {
            borderRadius: 14,
            paddingHorizontal: 24,
        },
        errorActions: {
            flexDirection: 'row',
            gap: 12,
        },
        signOutButton: {
            borderRadius: 14,
            paddingHorizontal: 24,
            borderColor: 'rgba(255,255,255,0.25)',
        },
        signOutButtonTitle: {
            color: appColors.textPrimary,
        },
    });
