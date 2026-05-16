/* eslint-disable */

export default {
    displayName: 'products-native-feature',
    preset: '../../../jest.react-native.preset.js',

    resolver: '@nx/jest/plugins/resolver',
    moduleFileExtensions: ['ts', 'js', 'html', 'tsx', 'jsx'],
    setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
    moduleNameMapper: {
        '.svg': '@nx/react-native/plugins/jest/svg-mock',
    },
};
