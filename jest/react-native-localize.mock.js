module.exports = {
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
  findBestAvailableLanguage: jest.fn(() => ({ languageTag: 'en', isRTL: false })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};
