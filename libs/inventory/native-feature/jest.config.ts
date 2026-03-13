/* eslint-disable */

export default {
    displayName: 'inventory-native-feature',
    preset: '../../../jest.react-native.preset.js',

    resolver: '@nrwl/jest/plugins/resolver',
    moduleFileExtensions: ['ts', 'js', 'html', 'tsx', 'jsx'],
    setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
    moduleNameMapper: {
        '.svg': '@nrwl/react-native/plugins/jest/svg-mock',
    },
};
