import DeviceInfo from 'react-native-device-info';
import { Printer } from '@pos/shared/models';
import { DataStore } from 'aws-amplify';
import { PrinterEntity } from './printer.entity';
import { Dispatch } from '@reduxjs/toolkit';
import { printingsActions } from './printers.slice';

export class PrinterService {
    static async setDefaultPrinter(dispatch: Dispatch, printer: PrinterEntity) {
        const defaultPrinter = await this.getDefaultPrinter();

        if (!defaultPrinter) {
            const entity = new Printer(printer);
            const res = await DataStore.save(entity);

            printer.id = res.id;
        } else {
            await DataStore.save(
                Printer.copyOf(defaultPrinter, updated => {
                    updated.deviceId = printer.deviceId;
                    updated.identifier = printer.identifier;
                    updated.interfaceType = printer.interfaceType;
                    updated.ip = printer.ip;
                    updated.model = printer.model;
                    updated.alias = printer.alias;
                })
            );
        }

        dispatch(printingsActions.setAsDefault(printer));
    }

    static async getDefaultPrinter() {
        const printers = await DataStore.query(Printer, p => p.deviceId('eq', DeviceInfo.getUniqueId()));
        return printers?.at(0);
    }
}
