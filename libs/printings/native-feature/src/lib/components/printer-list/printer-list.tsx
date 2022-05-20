import React, { useEffect, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DeviceInfo from 'react-native-device-info';
import { PrinterItem } from '../printer-item/printer-item';
import { View, StyleSheet, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useSharedStyles } from '@pos/theme/native';
import { useDispatch, useSelector } from 'react-redux';
import {
    discoverStarPrinters,
    fetchDefaultPrinter,
    getDefaultPrinter,
    PrinterService,
    PrinterEntity,
    stopDiscovery,
} from '@pos/printings/data-access';
import { UISpinner } from '@pos/shared/ui-native';

const deviceId = DeviceInfo.getUniqueId();

export interface PrintingListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function PrinterList({ navigation }: PrintingListProps) {
    const styles = useStyles();
    const dispatch = useDispatch();
    const [busy, setBusy] = useState<boolean>();
    const [printers, setPrinters] = useState<PrinterEntity[]>();
    const defaultPrinter = useSelector(getDefaultPrinter);

    useEffect(() => {
        dispatch(fetchDefaultPrinter());
    }, [dispatch]);

    useEffect(() => {
        const discover = async () => {
            setBusy(true);
            try {
                const list = await discoverStarPrinters();
                setPrinters(
                    list?.map((sp) => ({
                        deviceId,
                        identifier: sp.connectionSettings?.identifier,
                        interfaceType: sp.connectionSettings?.interfaceType,
                        ip: sp.information?.reserved.get('ipAddress'),
                        model: sp.information?.model,
                    }))
                );
            } catch (error) {
                Alert.alert('There was an error looking for available printers');
            } finally {
                setBusy(false);
            }
        };

        discover();

        return function cleanup() {
            stopDiscovery();
        };
    }, [setPrinters]);

    return (
        <View style={styles.page}>
            {defaultPrinter && (
                <PrinterItem
                    item={defaultPrinter}
                    navigation={navigation}
                    defaultPrinter={defaultPrinter}
                />
            )}
            {busy && (
                <View style={[styles.page, { paddingTop: 150 }]}>
                    <UISpinner size="small" message="Looking for printers..." />
                </View>
            )}
            {printers
                ?.filter(
                    (p) =>
                        !defaultPrinter ||
                        p.identifier !== defaultPrinter.identifier
                )
                .map((p) => (
                    <PrinterItem
                        item={p}
                        navigation={navigation}
                        defaultPrinter={defaultPrinter}
                        setAsDefault={async () =>
                            await PrinterService.setDefaultPrinter(dispatch, p)
                        }
                    />
                ))}
        </View>
    );
}

const useStyles = () => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({}),
    };
};
