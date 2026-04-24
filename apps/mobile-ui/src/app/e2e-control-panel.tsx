import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import {
    clearSampleAccountData,
    resetSampleAccountData,
    restoreSession,
} from '@pos/auth/data-access';
import {
    fetchEmployees,
} from '@pos/employees/data-access';
import {
    fetchGlobalSettings,
    fetchStationInfo,
    saveStationNumber,
} from '@pos/settings/data-access';
import { fetchStoreInfo } from '@pos/store-info/data-access';
import { fetchProducts } from '@pos/products/data-access';
import { fetchCategories } from '@pos/categories/data-access';
import { RootState, useAppDispatch } from '@pos/store';
import {
    activateE2EMode,
    clearE2EPrintJobs,
    deactivateE2EMode,
    getE2EState,
    isNativeE2ERequested,
    markE2ECleanupComplete,
    markE2EResetComplete,
    setE2ESeedStatus,
    subscribeToE2EState,
    translateWithFallback,
} from '@pos/shared/utils';
import { DataStore } from '@pos/shared/amplify';
import { configureDataStore } from '@pos/shared/data-store';

const E2E_STATION_NUMBER = '01';

const panelEnabled = () =>
    typeof __DEV__ !== 'undefined' && __DEV__ && isNativeE2ERequested();

export function E2EControlPanel() {
    const t = translateWithFallback;
    const dispatch = useAppDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const [e2eState, setLocalE2EState] = useState(getE2EState());
    const [lastAction, setLastAction] = useState('idle');
    const autoResetStartedRef = useRef(false);
    const panelVisible = panelEnabled();

    useEffect(() => {
        if (!panelVisible) {
            return;
        }

        return subscribeToE2EState(() => {
            setLocalE2EState(getE2EState());
        });
    }, [panelVisible]);

    const latestPrintJob = useMemo(() => {
        const last = e2eState.printJobs[e2eState.printJobs.length - 1];
        return last ? JSON.stringify(last) : '';
    }, [e2eState.printJobs]);
    const refreshBusinessState = async () => {
        await dispatch(saveStationNumber(E2E_STATION_NUMBER)).unwrap();
        await dispatch(fetchStationInfo()).unwrap();
        await Promise.all([
            dispatch(fetchStoreInfo()).unwrap(),
            dispatch(fetchGlobalSettings()).unwrap(),
            dispatch(fetchEmployees()).unwrap(),
            dispatch(fetchProducts()).unwrap(),
            dispatch(fetchCategories()).unwrap(),
        ]);
    };

    const resolveAuthUser = async () => {
        if (user) {
            return user;
        }

        try {
            return await dispatch(restoreSession()).unwrap();
        } catch {
            return null;
        }
    };

    const runReset = async () => {
        setLastAction('reset:pressed');
        const activeUser = await resolveAuthUser();
        if (!activeUser) {
            setLastAction('reset:missing-auth-user');
            setE2ESeedStatus('missing-auth-user');
            return;
        }

        activateE2EMode({
            seedTenant: true,
            cleanupOnExit: true,
            printerSpy: true,
        });
        clearE2EPrintJobs();
        setLastAction('reset:resetting');
        setE2ESeedStatus('resetting');

        try {
            await resetSampleAccountData(activeUser, { includeOrders: false });
            setLastAction('reset:refreshing-business');
            await refreshBusinessState();
            markE2EResetComplete();
            setLastAction('reset:ready');
            setE2ESeedStatus('ready');
        } catch (error) {
            setLastAction(
                `reset:error:${
                    error instanceof Error ? error.message : String(error)
                }`
            );
            setE2ESeedStatus(
                error instanceof Error ? error.message : String(error)
            );
        }
    };

    const runCleanup = async () => {
        setLastAction('cleanup:pressed');
        const activeUser = await resolveAuthUser();
        if (!activeUser) {
            setLastAction('cleanup:missing-auth-user');
            setE2ESeedStatus('missing-auth-user');
            return;
        }

        setLastAction('cleanup:cleaning');
        setE2ESeedStatus('cleaning');
        try {
            await clearSampleAccountData(activeUser);
            setLastAction('cleanup:refreshing-business');
            await refreshBusinessState();
            clearE2EPrintJobs();
            markE2ECleanupComplete();
            setLastAction('cleanup:clean');
            setE2ESeedStatus('clean');
            deactivateE2EMode();
        } catch (error) {
            setLastAction(
                `cleanup:error:${
                    error instanceof Error ? error.message : String(error)
                }`
            );
            setE2ESeedStatus(
                error instanceof Error ? error.message : String(error)
            );
        }
    };

    const runResetLocalSync = async () => {
        setLastAction('sync-reset:pressed');
        const activeUser = await resolveAuthUser();
        if (!activeUser) {
            setLastAction('sync-reset:missing-auth-user');
            setE2ESeedStatus('missing-auth-user');
            return;
        }

        setLastAction('sync-reset:resetting');
        setE2ESeedStatus('resetting-local-sync');

        try {
            await DataStore.stop();
            await DataStore.clear();
            configureDataStore();
            await DataStore.start();
            setLastAction('sync-reset:refreshing-business');
            await refreshBusinessState();
            setLastAction('sync-reset:ready');
            setE2ESeedStatus('local-sync-reset');
        } catch (error) {
            setLastAction(
                `sync-reset:error:${
                    error instanceof Error ? error.message : String(error)
                }`
            );
            setE2ESeedStatus(
                error instanceof Error ? error.message : String(error)
            );
        }
    };

    useEffect(() => {
        if (panelVisible && !e2eState.config.enabled) {
            activateE2EMode({
                seedTenant: true,
                cleanupOnExit: true,
                printerSpy: true,
            });
        }
    }, [e2eState.config.enabled, panelVisible]);

    useEffect(() => {
        if (!panelVisible || !e2eState.config.enabled || !e2eState.config.seedTenant) {
            autoResetStartedRef.current = false;
            return;
        }

        if (e2eState.seedStatus !== 'idle' || autoResetStartedRef.current) {
            return;
        }

        autoResetStartedRef.current = true;
        const timer = setTimeout(() => {
            void runReset();
        }, 0);

        return () => clearTimeout(timer);
    }, [e2eState.config.enabled, e2eState.config.seedTenant, e2eState.seedStatus, panelVisible]);

    if (!panelVisible) {
        return null;
    }

    return (
        <View pointerEvents="box-none" style={styles.root}>
            <View style={styles.panel} testID="e2e-panel">
                <Pressable
                    testID="e2e-reset-data"
                    accessibilityRole="button"
                    onPress={runReset}
                    style={styles.hitArea}
                >
                    <Text style={styles.actionLabel}>{t('E2E_Reset', 'Reset E2E')}</Text>
                </Pressable>
                <Pressable
                    testID="e2e-cleanup-data"
                    accessibilityRole="button"
                    onPress={runCleanup}
                    style={styles.hitArea}
                >
                    <Text style={styles.actionLabel}>
                        {t('E2E_Cleanup', 'Cleanup E2E')}
                    </Text>
                </Pressable>
                <Pressable
                    testID="e2e-reset-local-sync"
                    accessibilityRole="button"
                    onPress={runResetLocalSync}
                    style={styles.debugHitArea}
                >
                    <Text style={styles.debugLabel}>
                        {t('E2E_ResetSync', 'Reset Sync')}
                    </Text>
                </Pressable>
                <Text testID="e2e-seed-status" style={styles.hiddenLabel}>
                    {e2eState.seedStatus}
                </Text>
                <Text testID="e2e-auth-email" style={styles.hiddenLabel}>
                    {user?.email || ''}
                </Text>
                <Text testID="e2e-last-action" style={styles.hiddenLabel}>
                    {lastAction}
                </Text>
                <Text testID="e2e-print-count" style={styles.hiddenLabel}>
                    {String(e2eState.printJobs.length)}
                </Text>
                <Text testID="e2e-print-last" style={styles.hiddenLabel}>
                    {latestPrintJob}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        position: 'absolute',
        right: 0,
        top: 48,
        zIndex: 9999,
    },
    panel: {
        opacity: 0.55,
        padding: 4,
        width: 120,
        backgroundColor: 'rgba(12, 16, 24, 0.18)',
        borderRadius: 10,
    },
    hitArea: {
        width: 112,
        height: 24,
        marginBottom: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 6,
    },
    actionLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#f8fbff',
    },
    debugHitArea: {
        width: 112,
        height: 24,
        marginBottom: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.45)',
        borderRadius: 6,
    },
    debugLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#f8fbff',
    },
    hiddenLabel: {
        fontSize: 6,
        color: 'rgba(255,255,255,0.08)',
    },
});

export default E2EControlPanel;
