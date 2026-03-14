const rnPreset = require('react-native/jest-preset');

module.exports = {
  ...rnPreset,
  setupFiles: [
    require.resolve('./jest.performance-fix.js'),
    ...(rnPreset.setupFiles || []),
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|@rneui|react-native-.*|aws-amplify|@aws-amplify|@aws-sdk|uuid|react-redux|@reduxjs|redux-thunk|reselect|immer)/)',
  ],
};
