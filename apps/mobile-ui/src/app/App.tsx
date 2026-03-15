/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, Button, Text } from '@rneui/themed';
import { designTokens, theme } from '@pos/theme/native';
import { Provider, useSelector } from 'react-redux';
import { store, RootState, useAppDispatch } from '@pos/store';
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
import { DataStore } from '@pos/shared/amplify';

type BootstrapStatus = 'idle' | 'checking-session' | 'resolving-tenant' | 'preparing-business-data' | 'ready' | 'error';
const appTheme = theme('dark');
const appColors = designTokens.colors;

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

const StartupScreen = ({
    status,
    onRetry,
    errorMessage,
}: {
    status: Exclude<BootstrapStatus, 'ready'>;
    onRetry: () => void;
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
        <View style={styles.container}>
            <Image source={brandMark} style={styles.logo} resizeMode="contain" />
            {isError ? (
                <>
                    <Text h3 style={styles.title}>Startup failed</Text>
                    <Text style={styles.message}>
                        The app could not restore the business workspace. Retry the startup sequence.
                    </Text>
                    {errorMessage ? (
                        <Text style={styles.errorDetail}>{errorMessage}</Text>
                    ) : null}
                    <Button title="Retry" onPress={onRetry} buttonStyle={styles.retryButton} />
                </>
            ) : (
                <>
                    <Text h3 style={styles.title}>Preparing POS</Text>
                    <UISpinner size="large" message={messageByStatus[status]} />
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

    const startBootstrap = useCallback(async () => {
        if (process.env.NODE_ENV === 'test') {
            setBootstrapStatus('ready');
            return;
        }

        setBootstrapError(undefined);
        setBootstrapStatus('checking-session');

        try {
            let user = authUser;

            if (!user) {
                try {
                    user = await dispatch(restoreSession()).unwrap();
                } catch (error) {
                    if (error === 'NO_SESSION') {
                        clearCurrentTenantContext();
                        dispatch(authActions.logoff());
                        dispatch(tenantSessionActions.clearTenantSession());
                        dispatch(employeesActions.logoffEmployee());
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
                setBootstrapStatus('ready');
                return;
            }

            setBootstrapStatus('resolving-tenant');
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

            await DataStore.stop();
            await DataStore.clear();
            configureDataStore();
            await DataStore.start();
            await bootstrapTenantSession(user);

            setBootstrapStatus('preparing-business-data');
            dispatch(tenantSessionActions.setBootstrapStatus('bootstrapping'));

            await withTimeout(
                'fetchStationInfo()',
                dispatch(fetchStationInfo()).unwrap()
            );

            await Promise.all([
                dispatch(fetchStoreInfo()),
                dispatch(fetchGlobalSettings()),
                dispatch(fetchEmployees()),
            ]);

            dispatch(tenantSessionActions.setBootstrapStatus('ready'));
            setBootstrapStatus('ready');
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
        }
    }, [authUser, dispatch]);

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
    });
