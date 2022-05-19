import React, { useEffect, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrinterItem } from '../printer-item/printer-item';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useSharedStyles } from '@pos/theme/native';
import { useDispatch, useSelector } from 'react-redux';
import {
    discoverStarPrinters,
    fetchSavedPrinters,
    getDefaultPrinter,
    printingsActions,
} from '@pos/printings/data-access';
import { StarPrinter } from 'react-native-star-io10';
import { UISpinner } from '@pos/shared/ui-native';

export interface PrintingListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function PrinterList({ navigation }: PrintingListProps) {
    const styles = useStyles();
    const dispatch = useDispatch();
    const [busy, setBusy] = useState<boolean>();
    const [printers, setPrinters] = useState<StarPrinter[]>();
    const defaultPrinter = useSelector(getDefaultPrinter); 

    const setDefaultPrinter = (printer: StarPrinter) => {
        dispatch(printingsActions.select({
            identifier: printer.connectionSettings.identifier,
            ip: printer.information?.reserved.get('ipAddress'),
            model: printer.information?.model,
            interfaceType: printer.connectionSettings.interfaceType,
        }));
    };

    useEffect(() => {
        dispatch(fetchSavedPrinters());
    }, [dispatch]);

    useEffect(() => {
        const discover = async () => {
            setBusy(true);
            const list = await discoverStarPrinters();
            setPrinters(list);
            setBusy(false);
        };

        discover();
    }, []);

    if (busy)
        return (
            <View style={[styles.page, { paddingTop: 150 }]}>
                <UISpinner size="small" message="Looking for printers..." />
            </View>
        );

    return (
        <View style={styles.page}>
            {printers?.map((p) => (
                <PrinterItem
                    item={p}
                    navigation={navigation}
                    defaultPrinter={defaultPrinter}
                    setAsDefault={setDefaultPrinter}
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
