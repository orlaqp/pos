import React, { useEffect, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DeviceInfo from 'react-native-device-info';
import { PrinterItem } from '../printer-item/printer-item';
import { View, StyleSheet, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useSharedStyles } from '@pos/theme/native';
import { useSelector } from 'react-redux';
import {
    discoverStarPrinters,
    fetchDefaultPrinter,
    getDefaultPrinter,
    PrinterService,
    PrinterEntity,
    stopDiscovery,
} from '@pos/printings/data-access';
import { UIEmptyState, UISpinner } from '@pos/shared/ui-native';
import { useAppDispatch } from '@pos/store';

const deviceId = DeviceInfo.getUniqueIdSync();

export const mapDiscoveredPrinters = (list: any[] | undefined, currentDeviceId: string) =>
    list?.map((sp) => ({
        deviceId: currentDeviceId,
        identifier: sp.connectionSettings?.identifier,
        interfaceType: sp.connectionSettings?.interfaceType,
        ip: sp.information?.reserved.get('ipAddress'),
        model: sp.information?.model,
    })) || [];

export const discoverAndMapPrinters = async (
    discover: () => Promise<any[] | undefined>,
    currentDeviceId: string
) => mapDiscoveredPrinters(await discover(), currentDeviceId);

export const createSetDefaultPrinterHandler = (
    dispatch: any,
    printer: PrinterEntity,
    setDefaultPrinter: (
        dispatch: any,
        printer: PrinterEntity
    ) => Promise<any> = PrinterService.setDefaultPrinter
) => async () => await setDefaultPrinter(dispatch, printer);

export const discoverPrintersSafely = async (
    discover: () => Promise<any[] | undefined>,
    currentDeviceId: string
) => {
    try {
        return await discoverAndMapPrinters(discover, currentDeviceId);
    } catch {
        Alert.alert('There was an error looking for available printers');
        return [];
    }
};

export const shouldShowEmptyPrinterState = (
    busy: boolean | undefined,
    printers: PrinterEntity[] | undefined
) => !busy && !printers?.length;

export const shouldShowBusyPrinterState = (busy: boolean | undefined) => !!busy;

export const shouldShowPrinterItems = (
    busy: boolean | undefined,
    printers: PrinterEntity[] | undefined
) => !busy && !!printers?.length;

export interface PrintingListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function PrinterList({ navigation }: PrintingListProps) {
    const styles = useStyles();
    const dispatch = useAppDispatch();
    const [busy, setBusy] = useState<boolean>();
    const [printers, setPrinters] = useState<PrinterEntity[]>();
    const defaultPrinter = useSelector(getDefaultPrinter);

    useEffect(() => {
        dispatch(fetchDefaultPrinter());
    }, [dispatch]);

    useEffect(() => {
        const discover = async () => {
            setBusy(true);
            setPrinters(await discoverPrintersSafely(discoverStarPrinters, deviceId));
            setBusy(false);
        };

        discover();

        return function cleanup() {
            stopDiscovery();
        };
    }, [setPrinters]);

    if (shouldShowEmptyPrinterState(busy, printers))
        return (
            <View style={[styles.page, { paddingTop: 50 }]}>
                <UIEmptyState text= 'No printers were found' />
            </View>
        );

    return (
        <View style={styles.page}>
            {/* {defaultPrinter && (
                <PrinterItem
                    key='default'
                    item={defaultPrinter}
                    navigation={navigation}
                    defaultPrinter={defaultPrinter}
                />
            )} */}
            {shouldShowBusyPrinterState(busy) && (
                <View style={[styles.page, { paddingTop: 150 }]}>
                    <UISpinner size="small" message="Looking for printers..." />
                </View>
            )}
            {shouldShowPrinterItems(busy, printers) && printers?.map((p) => (
                    <PrinterItem
                        key={p.identifier}
                        item={p}
                        navigation={navigation}
                        defaultPrinter={defaultPrinter}
                        setAsDefault={createSetDefaultPrinterHandler(dispatch, p)}
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
