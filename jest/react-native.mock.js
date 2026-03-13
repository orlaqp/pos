module.exports = {
  Alert: { alert: jest.fn() },
  I18nManager: {
    forceRTL: jest.fn(),
    isRTL: false,
  },
  Platform: {
    OS: 'ios',
    select: (options) => (options && (options.ios ?? options.default)) || undefined,
  },
  NativeModules: {},
};
