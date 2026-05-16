import '@testing-library/jest-native/extend-expect';
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock.js';
import { View as mockView } from 'react-native';

jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo);
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock(
    'react-native-device-info',
    () => require('react-native-device-info/jest/react-native-device-info-mock'),
    { virtual: true }
);
jest.mock('react-native-star-io10', () => ({
    InterfaceType: { Lan: 'Lan' },
    StarConnectionSettings: jest.fn(),
    StarDeviceDiscoveryManager: jest.fn(),
    StarDeviceDiscoveryManagerFactory: { create: jest.fn() },
    StarPrinter: jest.fn(),
    StarXpandCommand: {
        PrinterBuilder: jest.fn(),
        MagnificationParameter: jest.fn(),
        DocumentBuilder: jest.fn(),
        StarXpandCommandBuilder: jest.fn(),
        Printer: {
            Alignment: { Center: 'Center', Left: 'Left', Right: 'Right' },
            InternationalCharacterType: { Usa: 'Usa' },
            QRCodeModel: { Model2: 'Model2' },
            QRCodeLevel: { L: 'L' },
            QRCodeParameter: jest.fn(),
        },
    },
}));
jest.mock(
    'react-native-star-io10/src/StarXpandCommand/Printer/CutType',
    () => ({
        CutType: { Partial: 'Partial' },
    })
);
jest.mock(
    'react-native-star-io10/src/StarXpandCommand/Printer/Alignment',
    () => ({
        Alignment: { Center: 'Center' },
    })
);
jest.mock('react-native-fs', () => ({
    DocumentDirectoryPath: '/tmp',
    exists: jest.fn(),
    mkdir: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    unlink: jest.fn(),
}));
jest.mock('react-native-image-picker', () => ({
    launchImageLibrary: jest.fn(),
    launchCamera: jest.fn(),
    MediaType: {},
}));
jest.mock('react-native-localize', () => ({
    getLocales: jest.fn(() => [{ languageTag: 'en-US', isRTL: false }]),
    getNumberFormatSettings: jest.fn(() => ({
        decimalSeparator: '.',
        groupingSeparator: ',',
    })),
    getCalendar: jest.fn(() => 'gregorian'),
    getCountry: jest.fn(() => 'US'),
    getCurrencies: jest.fn(() => ['USD']),
    getTemperatureUnit: jest.fn(() => 'celsius'),
    getTimeZone: jest.fn(() => 'America/New_York'),
    uses24HourClock: jest.fn(() => false),
    usesMetricSystem: jest.fn(() => false),
    findBestAvailableLanguage: jest.fn(() => ({
        languageTag: 'en',
        isRTL: false,
    })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
}));
jest.mock('@pos/theme/native', () => ({
    useSharedStyles: () => ({
        page: {},
        centeredHorizontally: {},
        row: {},
        alignEnd: {},
        primaryText: {},
    }),
}));
jest.mock('@rneui/themed', () => ({
    Input: () => null,
    Button: () => null,
    Switch: () => null,
    Icon: () => null,
    useTheme: () => ({
        theme: {
            colors: {
                primary: '#4aa3eb',
                background: '#000',
                grey5: '#444',
                grey4: '#555',
                grey3: '#666',
                grey2: '#777',
                grey1: '#ddd',
                grey0: '#fff',
                black: '#fff',
                error: '#f00',
                warning: '#ffb020',
                success: '#34c759',
            },
        },
        updateTheme: jest.fn(),
    }),
}));
jest.mock('react-native-gesture-handler', () => {
    return {
        GestureHandlerRootView: mockView,
        NativeViewGestureHandler: mockView,
        TapGestureHandler: mockView,
        PanGestureHandler: mockView,
        State: {},
    };
});
