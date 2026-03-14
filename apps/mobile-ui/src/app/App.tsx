/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, Button, Text } from '@rneui/themed';
import { designTokens, theme } from '@pos/theme/native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState } from '@pos/store';
import Navigation from './navigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppErrorBoundary } from './app-error-boundary';
import { Image, StyleSheet, View } from 'react-native';
import { UISpinner } from '@pos/shared/ui-native';
import {
    fetchGlobalSettings,
    fetchStationInfo,
    getGlobalSettingsLoadingStatus,
} from '@pos/settings/data-access';
import {
    fetchEmployees,
    selectLoadingStatus as selectEmployeesLoadingStatus,
} from '@pos/employees/data-access';
import {
    fetchStoreInfo,
    selectLoadindStatus as selectStoreInfoLoadingStatus,
} from '@pos/store-info/data-access';
import { selectStationLoadindStatus } from '@pos/settings/data-access';
import brandMark from '../../assets/branding/pos-icon-transparent-2048.png';

type BootstrapStatus = 'idle' | 'loading' | 'ready' | 'error';
const appTheme = theme('dark');
const appColors = designTokens.colors;

const StartupScreen = ({
    status,
    onRetry,
}: {
    status: Exclude<BootstrapStatus, 'ready'>;
    onRetry: () => void;
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
    const dispatch = useDispatch();
    const employeeStatus = useSelector(selectEmployeesLoadingStatus);
    const stationStatus = useSelector(selectStationLoadindStatus);
    const storeStatus = useSelector(selectStoreInfoLoadingStatus);
    const globalSettingsStatus = useSelector(getGlobalSettingsLoadingStatus);
    const authUser = useSelector((state: RootState) => state.auth.user);
    const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus>('idle');

    const startBootstrap = useCallback(async () => {
        setBootstrapStatus('loading');
        try {
            await Promise.all([
                dispatch(fetchEmployees()).unwrap(),
                dispatch(fetchStoreInfo()).unwrap(),
                dispatch(fetchStationInfo()).unwrap(),
                dispatch(fetchGlobalSettings()).unwrap(),
            ]);
            setBootstrapStatus('ready');
        } catch (error) {
            console.error('App bootstrap failed', error);
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

    const hasBootstrapError = useMemo(
        () =>
            [employeeStatus, stationStatus, storeStatus, globalSettingsStatus].includes('error'),
        [employeeStatus, stationStatus, storeStatus, globalSettingsStatus]
    );

    useEffect(() => {
        if (bootstrapStatus === 'loading' && hasBootstrapError) {
            setBootstrapStatus('error');
        }
    }, [bootstrapStatus, hasBootstrapError]);

    if (bootstrapStatus !== 'ready' && !authUser) {
        return <StartupScreen status={bootstrapStatus === 'error' ? 'error' : 'loading'} onRetry={startBootstrap} />;
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
        retryButton: {
            borderRadius: 14,
            paddingHorizontal: 24,
        },
    });
