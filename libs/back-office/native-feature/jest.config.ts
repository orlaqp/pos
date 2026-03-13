/* eslint-disable */
export default {
    displayName: 'back-office-native-feature',
    preset: '../../../jest.react-native.preset.js',

    resolver: '@nrwl/jest/plugins/resolver',
    moduleFileExtensions: ['ts', 'js', 'html', 'tsx', 'jsx'],
    setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
    moduleNameMapper: {
        '.svg': '@nrwl/react-native/plugins/jest/svg-mock',
    },

    collectCoverageFrom: [
        '<rootDir>/src/lib/components/**/*.{ts,tsx}',
        '!**/*.spec.{ts,tsx}',
        '!**/definitions.ts',
    ],
};
