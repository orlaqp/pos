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
import { fetchEmployees } from '@pos/employees/data-access';
import {
    fetchStoreInfo,
} from '@pos/store-info/data-access';
import { selectStationLoadindStatus } from '@pos/settings/data-access';
import brandMark from '../../assets/branding/pos-icon-transparent-2048.png';

type BootstrapStatus = 'idle' | 'loading' | 'ready' | 'error';
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

    return (
        <View style={styles.container}>
            <Image source={brandMark} style={styles.logo} resizeMode="contain" />
            {isError ? (
                <>
                    <Text h3 style={styles.title}>Startup failed</Text>
                    <Text style={styles.message}>
                        The app could not load required local data. Retry the startup sequence.
                    </Text>
                    {errorMessage ? (
                        <Text style={styles.errorDetail}>{errorMessage}</Text>
                    ) : null}
                    <Button title="Retry" onPress={onRetry} buttonStyle={styles.retryButton} />
                </>
            ) : (
                <>
                    <Text h3 style={styles.title}>Preparing POS</Text>
                    <UISpinner size="large" message="Loading employees and device settings..." />
                </>
            )}
        </View>
    );
};

const AppContent = () => {
    const dispatch = useAppDispatch();
    const stationStatus = useSelector(selectStationLoadindStatus);
    const stationError = useSelector((state: RootState) => state.station.error);
    const authUser = useSelector((state: RootState) => state.auth.user);
    const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus>('idle');
    const [bootstrapError, setBootstrapError] = useState<string>();

    const startBootstrap = useCallback(async () => {
        setBootstrapStatus('loading');
        setBootstrapError(undefined);
        try {
            await withTimeout(
                'fetchStationInfo()',
                dispatch(fetchStationInfo()).unwrap()
            );

            dispatch(fetchStoreInfo());
            dispatch(fetchGlobalSettings());

            // Employee sync is allowed to continue in the background so the app can
            // reach the login shell even if DataStore is still warming up.
            dispatch(fetchEmployees());
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
            setBootstrapError(message);
            setBootstrapStatus('error');
        }
    }, [dispatch]);

    useEffect(() => {
        if (process.env.NODE_ENV === 'test') {
            setBootstrapStatus('ready');
            return;
        }
        startBootstrap();
    }, [startBootstrap]);

    const visibleBootstrapError = useMemo(() => {
        if (bootstrapError) return bootstrapError;

        return stationError || undefined;
    }, [bootstrapError, stationError]);

    if (bootstrapStatus !== 'ready' && !authUser) {
        return (
            <StartupScreen
                status={bootstrapStatus === 'error' ? 'error' : 'loading'}
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
                    <ThemeProvider
                        // theme={theme(colorScheme === 'light' ? 'light' : 'dark')}
                        theme={appTheme}
                    >
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
