/* eslint-disable */
export default {
    displayName: 'orders-native-feature',
    preset: '../../../jest.react-native.preset.js',

    resolver: '@nx/jest/plugins/resolver',
    moduleFileExtensions: ['ts', 'js', 'html', 'tsx', 'jsx'],
    setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
    moduleNameMapper: {
        '^aws-amplify$': '<rootDir>/../../../jest/aws-amplify.mock.js',
        '^@aws-amplify/datastore$':
            '<rootDir>/../../../jest/aws-amplify-datastore.mock.js',
        '^@aws-amplify/api-graphql$':
            '<rootDir>/../../../jest/aws-amplify-api-graphql.mock.js',
        '^@react-native-async-storage/async-storage$':
            '<rootDir>/../../../jest/react-native-async-storage.mock.js',
        '^react-native-fs$': '<rootDir>/../../../jest/react-native-fs.mock.js',
        '^react-native-device-info$':
            '<rootDir>/../../../jest/react-native-device-info.mock.js',
        '^@react-native-community/netinfo$':
            '<rootDir>/../../../jest/react-native-netinfo.mock.js',
        '^react-native-localize$':
            '<rootDir>/../../../jest/react-native-localize.mock.js',
        '^react-native-gesture-handler$':
            '<rootDir>/../../../jest/react-native-gesture-handler.mock.js',
        '.svg': '@nx/react-native/plugins/jest/svg-mock',
    },
};
