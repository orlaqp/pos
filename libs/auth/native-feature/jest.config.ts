/* eslint-disable */
import basePreset from '../../../jest.preset.js';

export default {
    displayName: 'auth-native-feature',
    preset: '../../../jest.react-native.preset.js',

    resolver: '@nx/jest/plugins/resolver',
    moduleFileExtensions: ['ts', 'js', 'html', 'tsx', 'jsx'],
    setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
    moduleNameMapper: {
        ...(basePreset.moduleNameMapper || {}),
        '.svg': '@nx/react-native/plugins/jest/svg-mock',
    },
};
