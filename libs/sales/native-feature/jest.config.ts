/* eslint-disable */
export default {
    displayName: 'sales-native-feature',
    preset: '../../../jest.react-native.preset.js',

    resolver: '@nrwl/jest/plugins/resolver',
    moduleFileExtensions: ['ts', 'js', 'html', 'tsx', 'jsx'],
    setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
    moduleNameMapper: {
        '.svg': '@nrwl/react-native/plugins/jest/svg-mock',
    },

    coverageThreshold: {
        global: {
            statements: 94,
            branches: 75,
            functions: 95,
            lines: 95,
        },
    },
};
