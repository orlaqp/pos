import React, { useEffect, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DeviceInfo from 'react-native-device-info';
import { PrinterItem } from '../printer-item/printer-item';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { useSelector } from 'react-redux';
import {
    discoverStarPrinters,
    fetchDefaultPrinter,
    getDefaultPrinter,
    PrinterService,
    PrinterEntity,
    stopDiscovery,
} from '@pos/printings/data-access';
import {
    UICard,
    UIEmptyState,
    UIScreen,
    UIStack,
    UISpinner,
} from '@pos/shared/ui-native';
import { useAppDispatch } from '@pos/store';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

const deviceId = DeviceInfo.getUniqueIdSync();

export const mapDiscoveredPrinters = (
    list: any[] | undefined,
    currentDeviceId: string,
) =>
    list?.map((sp) => ({
        deviceId: currentDeviceId,
        identifier: sp.connectionSettings?.identifier,
        interfaceType: sp.connectionSettings?.interfaceType,
        ip: sp.information?.reserved.get('ipAddress'),
        model: sp.information?.model,
    })) || [];

export const discoverAndMapPrinters = async (
    discover: () => Promise<any[] | undefined>,
    currentDeviceId: string,
) => mapDiscoveredPrinters(await discover(), currentDeviceId);

export const createSetDefaultPrinterHandler =
    (
        dispatch: any,
        printer: PrinterEntity,
        setDefaultPrinter: (
            dispatch: any,
            printer: PrinterEntity,
        ) => Promise<any> = PrinterService.setDefaultPrinter,
    ) =>
    async () => {
        try {
            await setDefaultPrinter(dispatch, printer);
        } catch {
            Alert.alert('There was an error setting the default printer');
        }
    };

export const discoverPrintersSafely = async (
    discover: () => Promise<any[] | undefined>,
    currentDeviceId: string,
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
    printers: PrinterEntity[] | undefined,
) => !busy && !printers?.length;

export const shouldShowBusyPrinterState = (busy: boolean | undefined) => !!busy;

export const shouldShowPrinterItems = (
    busy: boolean | undefined,
    printers: PrinterEntity[] | undefined,
) => !busy && !!printers?.length;

export interface PrintingListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function PrinterList({ navigation }: PrintingListProps) {
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
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
            setPrinters(
                await discoverPrintersSafely(discoverStarPrinters, deviceId),
            );
            setBusy(false);
        };

        discover();

        return function cleanup() {
            stopDiscovery();
        };
    }, [setPrinters]);

    if (shouldShowEmptyPrinterState(busy, printers))
        return (
            <UIScreen padded>
                <View style={styles.container}>
                    <UICard tone="muted" radius="lg">
                        <Text style={styles.title}>Printer setup</Text>
                        <Text style={styles.subtitle}>
                            Discover printers on this device network and choose
                            the default receipt printer.
                        </Text>
                    </UICard>
                    <UICard style={styles.emptyCard}>
                        <UIEmptyState text="No printers were found" />
                    </UICard>
                </View>
            </UIScreen>
        );

    return (
        <UIScreen padded>
            <View style={styles.container}>
                <UICard tone="muted" radius="lg">
                    <View style={styles.headerRow}>
                        <View style={styles.headerTextWrap}>
                            <Text style={styles.title}>Printer setup</Text>
                            <Text style={styles.subtitle}>
                                Discover printers on this device network and
                                choose the default receipt printer.
                            </Text>
                        </View>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>
                                {busy
                                    ? 'Scanning'
                                    : `${printers?.length || 0} found`}
                            </Text>
                        </View>
                    </View>
                </UICard>
                {/* {defaultPrinter && (
                <PrinterItem
                    key='default'
                    item={defaultPrinter}
                    navigation={navigation}
                    defaultPrinter={defaultPrinter}
                />
            )} */}
                {shouldShowBusyPrinterState(busy) && (
                    <UICard style={styles.loadingCard}>
                        <UISpinner
                            size="small"
                            message="Looking for printers..."
                        />
                    </UICard>
                )}
                {shouldShowPrinterItems(busy, printers) && (
                    <UIStack spacing="sm" style={styles.listStack}>
                        {printers?.map((p) => (
                            <PrinterItem
                                key={p.identifier}
                                item={p}
                                navigation={navigation}
                                defaultPrinter={defaultPrinter}
                                setAsDefault={createSetDefaultPrinterHandler(
                                    dispatch,
                                    p,
                                )}
                            />
                        ))}
                    </UIStack>
                )}
            </View>
        </UIScreen>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        container: {
            width: '100%',
            maxWidth: 1240,
            alignSelf: 'center',
            gap: tokens.spacing.md,
        },
        headerRow: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        headerTextWrap: {
            flex: 1,
            paddingRight: tokens.spacing.md,
        },
        title: {
            color: tokens.colors.textPrimary,
            fontSize: 28,
            fontWeight: '700',
        },
        subtitle: {
            color: tokens.colors.textSecondary,
            fontSize: 15,
            lineHeight: 21,
            marginTop: tokens.spacing.xs,
        },
        statusBadge: {
            borderRadius: 999,
            borderWidth: 1,
            borderColor: `${tokens.colors.accent}55`,
            backgroundColor: `${tokens.colors.accent}14`,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.xs,
        },
        statusText: {
            color: tokens.colors.accent,
            fontSize: 12,
            fontWeight: '800',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
        },
        listStack: {
            width: '100%',
        },
        loadingCard: {
            minHeight: 180,
            alignItems: 'center',
            justifyContent: 'center',
        },
        emptyCard: {
            minHeight: 260,
            alignItems: 'center',
            justifyContent: 'center',
        },
    });
