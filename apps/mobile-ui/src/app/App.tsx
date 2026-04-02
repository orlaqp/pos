/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, Button, Text } from '@rneui/themed';
import { designTokens, theme } from '@pos/theme/native';
import { Provider, useSelector } from 'react-redux';
import { store, RootState, useAppDispatch } from '@pos/store';
import { logSyncDebug, startSyncMeasure } from '@pos/shared/utils';
import Navigation from './navigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppErrorBoundary } from './app-error-boundary';
import { Alert, AppState, Image, StyleSheet, View } from 'react-native';
import { UISpinner } from '@pos/shared/ui-native';
import {
    fetchDeviceSettings,
    fetchGlobalSettings,
    fetchStationInfo,
} from '@pos/settings/data-access';
import {
    EmployeeService,
    fetchEmployees,
    employeesActions,
    subscribeToEmployeeChanges,
    syncEmployees,
} from '@pos/employees/data-access';
import { fetchStoreInfo } from '@pos/store-info/data-access';
import { fetchDefaultPrinter } from '@pos/printings/data-access';
import { subscribeToProductChanges, syncProducts } from '@pos/products/data-access';
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
import { configureDataStore } from '@pos/shared/data-store';
import { API, Auth, DataStore } from '@pos/shared/amplify';
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
import { listEmployees } from '@pos/shared/api';

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
const FOREGROUND_SESSION_CHECK_THROTTLE_MS = 5 * 60_000;

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

const logRemoteEmployeesForTenant = async (tenantId: string) => {
    const response = await API.graphql<{
        listEmployees?: {
            items?: Array<{
                id?: string | null;
                tenantId?: string | null;
                email?: string | null;
                active?: boolean | null;
                _deleted?: boolean | null;
                _lastChangedAt?: number | null;
            } | null> | null;
            nextToken?: string | null;
        } | null;
    }>({
        query: listEmployees,
        variables: {
            filter: {
                tenantId: { eq: tenantId },
            },
            limit: 100,
        },
        authMode: 'userPool',
    });

    const items = response.data?.listEmployees?.items ?? [];
    logSyncDebug('app-bootstrap', 'employees:remote-visible-to-user', {
        tenantId,
        itemCount: items.length,
        nextToken: response.data?.listEmployees?.nextToken ?? null,
        sample: items.slice(0, 10).map((employee) => ({
            id: employee?.id ?? null,
            tenantId: employee?.tenantId ?? null,
            email: employee?.email ?? null,
            active: employee?.active ?? null,
            deleted: employee?._deleted ?? null,
            lastChangedAt: employee?._lastChangedAt ?? null,
        })),
    });
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

const setLastBootstrappedTenantId = async (tenantId: string) => {
    try {
        await AsyncStorage.setItem(LAST_BOOTSTRAPPED_TENANT_KEY, tenantId);
    } catch {
        // Best-effort cache marker; bootstrap should continue even if this fails.
    }
};

const clearLastBootstrappedTenantId = async () => {
    try {
        await AsyncStorage.removeItem(LAST_BOOTSTRAPPED_TENANT_KEY);
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
    const dispatch = useAppDispatch();
    const authUser = useSelector((state: RootState) => state.auth.user);
    const authError = useSelector((state: RootState) => state.auth.error);
    const authRestoreStatus = useSelector(selectAuthRestoreStatus);
    const tenantSession = useSelector((state: RootState) => state.tenantSession);
    const cart = useSelector(selectCart);
    const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus>('idle');
    const [bootstrapError, setBootstrapError] = useState<string>();
    const [sessionRecoveryState, setSessionRecoveryState] =
        useState<SessionRecoveryState>('healthy');
    const bootstrapInFlightRef = useRef<Promise<void> | null>(null);
    const sessionExpiryAlertShownRef = useRef(false);
    const sessionValidationInFlightRef = useRef<Promise<void> | null>(null);
    const silentReauthInFlightRef = useRef<Promise<User | null> | null>(null);
    const lastForegroundSessionCheckAtRef = useRef(0);
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

    const startBootstrap = useCallback(async () => {
        if (bootstrapInFlightRef.current) {
            logSyncDebug('app-bootstrap', 'startup:skip-inflight');
            return bootstrapInFlightRef.current;
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
            const lastTenantId = await getLastBootstrappedTenantId();
            const shouldClearDataStore =
                !!lastTenantId &&
                lastTenantId !== user.tenantId;
            logSyncDebug('app-bootstrap', 'tenant-cache:state', {
                lastTenantId,
                currentTenantId: user.tenantId,
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

            try {
                await logRemoteEmployeesForTenant(user.tenantId);
            } catch (error) {
                logBootstrapStageError('logRemoteEmployeesForTenant()', error);
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

            const finishBusinessData = startSyncMeasure('app-bootstrap', 'business-data.fetches');
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

            dispatch(tenantSessionActions.setBootstrapStatus('ready'));
            setBootstrapStatus('ready');
            recordLifecycleEvent('bootstrap:ready', {
                tenantId: user.tenantId,
            });
            finishBootstrap({
                result: 'ready',
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
    }, [attemptSilentReauth, authUser, dispatch, recordLifecycleEvent]);

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
        startBootstrap();
    }, [startBootstrap]);

    useEffect(() => {
        if (!authUser || !tenantSession.currentTenantId || bootstrapStatus !== 'ready') {
            return;
        }

        logSyncDebug('app-employees', 'subscribe:start', {
            tenantId: tenantSession.currentTenantId,
            bootstrapStatus,
        });

        syncEmployees(dispatch);
        const employeesSub = subscribeToEmployeeChanges(dispatch);

        return () => {
            logSyncDebug('app-employees', 'subscribe:stop', {
                tenantId: tenantSession.currentTenantId,
                bootstrapStatus,
            });
            employeesSub.unsubscribe();
        };
    }, [authUser, bootstrapStatus, dispatch, tenantSession.currentTenantId]);

    useEffect(() => {
        if (
            !authUser ||
            !tenantSession.currentTenantId ||
            bootstrapStatus !== 'ready'
        ) {
            return;
        }

        logSyncDebug('app-products', 'subscribe:start', {
            tenantId: tenantSession.currentTenantId,
            bootstrapStatus,
        });

        syncProducts(dispatch);
        const productsSub = subscribeToProductChanges(dispatch);

        return () => {
            logSyncDebug('app-products', 'subscribe:stop', {
                tenantId: tenantSession.currentTenantId,
                bootstrapStatus,
            });
            productsSub.unsubscribe();
        };
    }, [authUser, bootstrapStatus, dispatch, tenantSession.currentTenantId]);

    useEffect(() => {
        if (!authUser) {
            sessionExpiryAlertShownRef.current = false;
            setSessionRecoveryState('healthy');
            return;
        }

        const subscription = AppState.addEventListener('change', async (nextState) => {
            recordLifecycleEvent('appstate.change', { nextState });
            if (nextState !== 'active') {
                return;
            }

            const now = Date.now();
            if (
                now - lastForegroundSessionCheckAtRef.current <
                FOREGROUND_SESSION_CHECK_THROTTLE_MS
            ) {
                return;
            }

            if (sessionValidationInFlightRef.current) {
                return;
            }

            lastForegroundSessionCheckAtRef.current = now;

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

            try {
                await validationPromise;
            } finally {
                if (sessionValidationInFlightRef.current === validationPromise) {
                    sessionValidationInFlightRef.current = null;
                }
            }
        });

        return () => {
            subscription.remove();
        };
    }, [authUser, handleExpiredSession, recordLifecycleEvent]);

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
        <NavigationContainer>
            <Navigation />
        </NavigationContainer>
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
