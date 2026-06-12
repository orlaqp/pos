import '@testing-library/jest-native/extend-expect';
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock.js';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo);
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('react-native-gesture-handler', () => {
    const { View } = jest.requireActual('react-native');
    const actual = jest.requireActual('react-native-gesture-handler/jestSetup');
    return {
        ...actual,
        GestureHandlerRootView: View,
        NativeViewGestureHandler: View,
        TapGestureHandler: View,
        PanGestureHandler: View,
        State: {},
    };
});
jest.mock('react-native-fs', () => ({
    DocumentDirectoryPath: '/tmp',
    CachesDirectoryPath: '/tmp',
    exists: jest.fn(),
    mkdir: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    unlink: jest.fn(),
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
    findBestLanguageTag: jest.fn(() => ({
        languageTag: 'en',
        isRTL: false,
    })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
}));
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
jest.mock('react-native-chart-kit', () => {
    const React = jest.requireActual('react');
    const { View } = jest.requireActual('react-native');
    const MockChart = ({ children, ...rest }: { children?: unknown }) =>
        React.createElement(View, rest, children);
    return {
        LineChart: MockChart,
        PieChart: MockChart,
        BarChart: MockChart,
        ContributionGraph: MockChart,
        ProgressChart: MockChart,
        StackedBarChart: MockChart,
    };
});
jest.mock('@react-native-community/datetimepicker', () => {
    const React = jest.requireActual('react');
    const { View } = jest.requireActual('react-native');
    const MockDateTimePicker = (props: Record<string, unknown>) =>
        React.createElement(View, {
            ...props,
            testID: props.testID || 'mock-date-time-picker',
        });

    return {
        __esModule: true,
        default: MockDateTimePicker,
    };
});
