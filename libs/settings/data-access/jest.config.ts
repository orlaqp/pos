/* eslint-disable */
// @ts-ignore jest preset is a plain JS module
import basePreset from '../../../jest.preset.js';

export default {
    displayName: 'settings-data-access',
    preset: '../../../jest.preset.js',
    setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
    transform: {
        '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json', diagnostics: false }],
    },
    moduleNameMapper: {
        ...(basePreset.moduleNameMapper || {}),
        '^react-native$': '<rootDir>/../../../jest/react-native.mock.js',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../../coverage/libs/settings/data-access',
};
