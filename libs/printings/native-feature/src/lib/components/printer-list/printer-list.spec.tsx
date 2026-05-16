import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import {
    createSetDefaultPrinterHandler,
    discoverAndMapPrinters,
    discoverPrintersSafely,
    mapDiscoveredPrinters,
    PrinterList,
    shouldShowBusyPrinterState,
    shouldShowEmptyPrinterState,
    shouldShowPrinterItems,
} from './printer-list';

jest.mock('@pos/theme/native', () => ({
    useTheme: () => 'dark',
    useSharedStyles: () => ({
        page: {},
        darkBackground: {},
    }),
    getThemeColors: () => ({
        primary: '#4aa3eb',
        grey0: '#ffffff',
        grey5: '#6b7280',
    }),
}));

describe('PrinterList', () => {
    it('should render successfully', async () => {
        const navigation: any = { navigate: jest.fn() };
        const { getByText } = render(<PrinterList navigation={navigation} />);
        expect(getByText('Printer setup')).toBeTruthy();
        await waitFor(() =>
            expect(getByText('No printers were found')).toBeTruthy(),
        );
    });

    it('maps discovered star printers into printer entities', () => {
        const discovered = [
            {
                connectionSettings: {
                    identifier: 'tcp:10.0.0.20',
                    interfaceType: 'Lan',
                },
                information: {
                    reserved: new Map([['ipAddress', '10.0.0.20']]),
                    model: 'TSP100',
                },
            },
        ];

        expect(mapDiscoveredPrinters(discovered as any, 'device-1')).toEqual([
            {
                deviceId: 'device-1',
                identifier: 'tcp:10.0.0.20',
                interfaceType: 'Lan',
                ip: '10.0.0.20',
                model: 'TSP100',
            },
        ]);
    });

    it('returns empty discovery map when list is missing', () => {
        expect(mapDiscoveredPrinters(undefined, 'device-1')).toEqual([]);
    });

    it('builds a set-default handler that forwards dispatch and printer', async () => {
        const dispatch = jest.fn();
        const setDefault = jest.fn(() => Promise.resolve());
        const printer: any = { identifier: 'tcp:10.0.0.20' };

        const handler = createSetDefaultPrinterHandler(
            dispatch,
            printer,
            setDefault,
        );
        await handler();

        expect(setDefault).toHaveBeenCalledWith(dispatch, printer);
    });

    it('alerts when setting the default printer fails', async () => {
        const dispatch = jest.fn();
        const setDefault = jest.fn(() => Promise.reject(new Error('failed')));
        const printer: any = { identifier: 'tcp:10.0.0.20' };
        const alertSpy = jest
            .spyOn(Alert, 'alert')
            .mockImplementation(jest.fn());

        const handler = createSetDefaultPrinterHandler(
            dispatch,
            printer,
            setDefault,
        );
        await handler();

        expect(alertSpy).toHaveBeenCalledWith(
            'There was an error setting the default printer',
        );

        alertSpy.mockRestore();
    });

    it('discovers and maps printers in one async helper', async () => {
        const discover = jest.fn(async () => [
            {
                connectionSettings: {
                    identifier: 'usb:1',
                    interfaceType: 'Usb',
                },
                information: {
                    reserved: new Map([['ipAddress', undefined]]),
                    model: 'mC-Print3',
                },
            },
        ]);

        await expect(
            discoverAndMapPrinters(discover, 'device-2'),
        ).resolves.toEqual([
            {
                deviceId: 'device-2',
                identifier: 'usb:1',
                interfaceType: 'Usb',
                ip: undefined,
                model: 'mC-Print3',
            },
        ]);
    });

    it('returns empty list and alerts when discovery fails', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        const failingDiscover = jest.fn(async () => {
            throw new Error('failed');
        });

        await expect(
            discoverPrintersSafely(failingDiscover, 'device-3'),
        ).resolves.toEqual([]);
        expect(alertSpy).toHaveBeenCalledWith(
            'There was an error looking for available printers',
        );
    });

    it('evaluates printer list view states', () => {
        expect(shouldShowEmptyPrinterState(false, [])).toBe(true);
        expect(shouldShowEmptyPrinterState(true, [])).toBe(false);
        expect(shouldShowBusyPrinterState(true)).toBe(true);
        expect(shouldShowBusyPrinterState(false)).toBe(false);
        expect(
            shouldShowPrinterItems(false, [{ identifier: 'p1' } as any]),
        ).toBe(true);
        expect(
            shouldShowPrinterItems(true, [{ identifier: 'p1' } as any]),
        ).toBe(false);
    });
});
