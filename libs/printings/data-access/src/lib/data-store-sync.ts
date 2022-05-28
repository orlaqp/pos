import { DataStore } from 'aws-amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { Printer } from '@pos/shared/models';
import { printingsActions } from './slices/printers.slice';
import DeviceInfo from 'react-native-device-info';
import { PrinterEntityMapper } from './slices/printer.entity';

const deviceId = DeviceInfo.getUniqueId();

export const syncDefaultPrinter = (dispatch: Dispatch) => {
    console.log('Syncing printers to the store');
    DataStore.query(Printer).then((items) => {
        const defaultPrinter = items.find(p => p.deviceId === deviceId);

        if (!defaultPrinter) return;

        dispatch(printingsActions.setAsDefault(PrinterEntityMapper.fromModel(defaultPrinter)));
    });
};
