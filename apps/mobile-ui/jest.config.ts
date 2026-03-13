/* eslint-disable */
export default {
    displayName: 'mobile-ui',
    preset: '../../jest.react-native.preset.js',

    resolver: '@nrwl/jest/plugins/resolver',
    moduleFileExtensions: ['ts', 'js', 'html', 'tsx', 'jsx'],
    setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
    modulePathIgnorePatterns: ['<rootDir>/#current-cloud-backend'],
    moduleNameMapper: {
        '.svg': '@nrwl/react-native/plugins/jest/svg-mock',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(@react-native|react-native|@react-navigation|@rneui|react-native-.*|aws-amplify|@aws-amplify|@aws-sdk|uuid)/)',
    ],
};
