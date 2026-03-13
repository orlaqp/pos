const nxPreset = require('@nrwl/jest/preset').default;

module.exports = {
  ...nxPreset,
  moduleNameMapper: {
    ...(nxPreset.moduleNameMapper || {}),
    '^aws-amplify$': require.resolve('./jest/aws-amplify.mock.js'),
    '^@aws-amplify/datastore$': require.resolve('./jest/aws-amplify-datastore.mock.js'),
    '^@aws-amplify/api-graphql$': require.resolve('./jest/aws-amplify-api-graphql.mock.js'),
    '^react-native-fs$': require.resolve('./jest/react-native-fs.mock.js'),
    '^react-native-device-info$': require.resolve('./jest/react-native-device-info.mock.js'),
    '^@react-native-async-storage/async-storage$': require.resolve(
      '@react-native-async-storage/async-storage/jest/async-storage-mock'
    ),
    '^react-native-image-picker$': require.resolve('./jest/react-native-image-picker.mock.js'),
    '^react-native-star-io10$': require.resolve('./jest/react-native-star-io10.mock.js'),
    '^react-native-star-io10/src/StarXpandCommand/Printer/CutType$':
      require.resolve('./jest/react-native-star-io10-cut-type.mock.js'),
    '^react-native-star-io10/src/StarXpandCommand/Printer/Alignment$':
      require.resolve('./jest/react-native-star-io10-alignment.mock.js'),
    '^@react-native-community/netinfo$': require.resolve('./jest/react-native-netinfo.mock.js'),
    '^react-native-localize$': require.resolve('./jest/react-native-localize.mock.js'),
    '^react-native-gesture-handler$': require.resolve('./jest/react-native-gesture-handler.mock.js'),
  },
};
