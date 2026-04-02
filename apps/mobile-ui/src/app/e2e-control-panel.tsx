import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import {
    clearSampleAccountData,
    resetSampleAccountData,
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
    markE2ECleanupComplete,
    markE2EResetComplete,
    setE2ESeedStatus,
    subscribeToE2EState,
} from '@pos/shared/utils';
import { DataStore } from '@pos/shared/amplify';
import { configureDataStore } from '@pos/shared/data-store';

const E2E_STATION_NUMBER = '01';

const panelEnabled = () => typeof __DEV__ !== 'undefined' && __DEV__;

export function E2EControlPanel() {
    const dispatch = useAppDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const [e2eState, setLocalE2EState] = useState(getE2EState());

    useEffect(() => {
        if (!panelEnabled()) {
            return;
        }

        return subscribeToE2EState(() => {
            setLocalE2EState(getE2EState());
        });
    }, []);

    const latestPrintJob = useMemo(() => {
        const last = e2eState.printJobs[e2eState.printJobs.length - 1];
        return last ? JSON.stringify(last) : '';
    }, [e2eState.printJobs]);

    if (!panelEnabled()) {
        return null;
    }

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

    const runReset = async () => {
        if (!user) {
            setE2ESeedStatus('missing-auth-user');
            return;
        }

        activateE2EMode({
            seedTenant: true,
            cleanupOnExit: true,
            printerSpy: true,
        });
        clearE2EPrintJobs();
        setE2ESeedStatus('resetting');

        try {
            await resetSampleAccountData(user, { includeOrders: false });
            await refreshBusinessState();
            markE2EResetComplete();
            setE2ESeedStatus('ready');
        } catch (error) {
            setE2ESeedStatus(
                error instanceof Error ? error.message : String(error)
            );
        }
    };

    const runCleanup = async () => {
        if (!user) {
            setE2ESeedStatus('missing-auth-user');
            return;
        }

        setE2ESeedStatus('cleaning');
        try {
            await clearSampleAccountData(user);
            await refreshBusinessState();
            clearE2EPrintJobs();
            markE2ECleanupComplete();
            setE2ESeedStatus('clean');
            deactivateE2EMode();
        } catch (error) {
            setE2ESeedStatus(
                error instanceof Error ? error.message : String(error)
            );
        }
    };

    const runResetLocalSync = async () => {
        if (!user) {
            setE2ESeedStatus('missing-auth-user');
            return;
        }

        setE2ESeedStatus('resetting-local-sync');

        try {
            await DataStore.stop();
            await DataStore.clear();
            configureDataStore();
            await DataStore.start();
            await refreshBusinessState();
            setE2ESeedStatus('local-sync-reset');
        } catch (error) {
            setE2ESeedStatus(
                error instanceof Error ? error.message : String(error)
            );
        }
    };

    return (
        <View pointerEvents="box-none" style={styles.root}>
            <View style={styles.panel} testID="e2e-panel">
                <Pressable testID="e2e-reset-data" onPress={runReset} style={styles.hitArea}>
                    <Text style={styles.hiddenLabel}>Reset E2E</Text>
                </Pressable>
                <Pressable testID="e2e-cleanup-data" onPress={runCleanup} style={styles.hitArea}>
                    <Text style={styles.hiddenLabel}>Cleanup E2E</Text>
                </Pressable>
                <Pressable
                    testID="e2e-reset-local-sync"
                    onPress={runResetLocalSync}
                    style={styles.debugHitArea}
                >
                    <Text style={styles.debugLabel}>Reset Sync</Text>
                </Pressable>
                <Text testID="e2e-seed-status" style={styles.hiddenLabel}>
                    {e2eState.seedStatus}
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
        opacity: 0.22,
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
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 6,
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
