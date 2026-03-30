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
import { Image, StyleSheet, View } from 'react-native';
import { UISpinner } from '@pos/shared/ui-native';
import {
    fetchGlobalSettings,
    fetchStationInfo,
} from '@pos/settings/data-access';
import { fetchEmployees, employeesActions } from '@pos/employees/data-access';
import { fetchStoreInfo } from '@pos/store-info/data-access';
import brandMark from '../../assets/branding/pos-icon-transparent-2048.png';
import {
    authActions,
    bootstrapTenantSession,
    clearCurrentTenantContext,
    restoreSession,
    selectAuthRestoreStatus,
    setCurrentTenantContext,
    tenantSessionActions,
} from '@pos/auth/data-access';
import { configureDataStore } from '@pos/shared/data-store';
import { Auth, DataStore } from '@pos/shared/amplify';
import { E2EControlPanel } from './e2e-control-panel';
import {
    clearManualSignOut,
    markManualSignOut,
    readManualSignOut,
} from './session-signout';

type BootstrapStatus = 'idle' | 'checking-session' | 'resolving-tenant' | 'preparing-business-data' | 'ready' | 'error';
const appTheme = theme('dark');
const appColors = designTokens.colors;
const LAST_BOOTSTRAPPED_TENANT_KEY = 'last-bootstrapped-tenant-id-v1';

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
    const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus>('idle');
    const [bootstrapError, setBootstrapError] = useState<string>();
    const bootstrapInFlightRef = useRef<Promise<void> | null>(null);

    const resetSessionState = useCallback(async () => {
        try {
            await markManualSignOut();
            await DataStore.stop();
            await DataStore.clear();
        } finally {
            clearCurrentTenantContext();
            dispatch(authActions.logoff());
            dispatch(tenantSessionActions.clearTenantSession());
            dispatch(employeesActions.logoffEmployee());
            await clearLastBootstrappedTenantId();
        }
    }, [dispatch]);

    const startBootstrap = useCallback(async () => {
        if (bootstrapInFlightRef.current) {
            logSyncDebug('app-bootstrap', 'startup:skip-inflight');
            return bootstrapInFlightRef.current;
        }

        const bootstrapPromise = (async () => {
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
                    if (error === 'NO_SESSION') {
                        clearCurrentTenantContext();
                        dispatch(authActions.logoff());
                        dispatch(tenantSessionActions.clearTenantSession());
                        dispatch(employeesActions.logoffEmployee());
                        void clearLastBootstrappedTenantId();
                        setBootstrapStatus('ready');
                        return;
                    }

                    throw error;
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
            const shouldClearDataStore = !!lastTenantId && lastTenantId !== user.tenantId;
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

            const finishBusinessData = startSyncMeasure('app-bootstrap', 'business-data.fetches');
            const businessDataResults = await Promise.allSettled([
                dispatch(fetchStoreInfo()).unwrap(),
                dispatch(fetchGlobalSettings()).unwrap(),
                dispatch(fetchEmployees()).unwrap(),
            ]);
            finishBusinessData({
                storeInfo: businessDataResults[0].status,
                globalSettings: businessDataResults[1].status,
                employees: businessDataResults[2].status,
            });

            const stageLabels = [
                'fetchStoreInfo()',
                'fetchGlobalSettings()',
                'fetchEmployees()',
            ];

            businessDataResults.forEach((result, index) => {
                if (result.status === 'rejected') {
                    logBootstrapStageError(stageLabels[index], result.reason);
                }
            });

            dispatch(tenantSessionActions.setBootstrapStatus('ready'));
            setBootstrapStatus('ready');
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
    }, [authUser, dispatch]);

    const signOutFromStartup = useCallback(async () => {
        setBootstrapError(undefined);

        try {
            await Auth.signOut();
        } catch (error) {
            console.error('Startup sign out failed', error);
        } finally {
            await resetSessionState();
            setBootstrapStatus('ready');
        }
    }, [resetSessionState]);

    useEffect(() => {
        startBootstrap();
    }, [startBootstrap]);

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
