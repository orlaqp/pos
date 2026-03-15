import '@testing-library/jest-native/extend-expect';

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-localize', () => ({
    getLocales: jest.fn(() => [{ languageTag: 'en-US', isRTL: false }]),
    getNumberFormatSettings: jest.fn(() => ({
        decimalSeparator: '.',
        groupingSeparator: ',',
    })),
    getCalendar: jest.fn(() => 'gregorian'),
    getCountry: jest.fn(() => 'US'),
    getCurrencies: jest.fn(() => ['USD']),
    getTemperatureUnit: jest.fn(() => 'fahrenheit'),
    getTimeZone: jest.fn(() => 'America/New_York'),
    uses24HourClock: jest.fn(() => false),
    usesMetricSystem: jest.fn(() => false),
    findBestAvailableLanguage: jest.fn(() => ({ languageTag: 'en', isRTL: false })),
    findBestLanguageTag: jest.fn(() => ({ languageTag: 'en', isRTL: false })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
}));

jest.mock('@pos/shared/amplify', () => ({
    Amplify: {
        configure: jest.fn(),
    },
    Auth: {
        signIn: jest.fn(),
        signOut: jest.fn(),
        signUp: jest.fn(),
        currentAuthenticatedUser: jest.fn(),
    },
    Storage: {
        get: jest.fn().mockResolvedValue('https://example.com/mock.png'),
        put: jest.fn().mockResolvedValue({ key: 'mock-key' }),
        remove: jest.fn().mockResolvedValue({}),
    },
    API: {
        graphql: jest.fn(),
    },
    DataStore: {
        query: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
        observe: jest.fn(),
        observeQuery: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        clear: jest.fn(),
        configure: jest.fn(),
    },
    Hub: {
        listen: jest.fn(),
    },
    syncExpression: jest.fn(),
}));

jest.mock('@pos/products/data-access', () => ({
    productsSubscription: {
        unsubscribe: jest.fn(),
    },
    productsActions: {
        reset: jest.fn(() => ({ type: 'products/reset' })),
    },
}));
