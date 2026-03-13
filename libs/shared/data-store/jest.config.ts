/* eslint-disable */
const basePreset = require('../../../jest.preset');

export default {
    displayName: 'shared-data-store',
    preset: '../../../jest.preset.js',
    transform: {
        '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }],
    },
    moduleNameMapper: {
        ...(basePreset.moduleNameMapper || {}),
        '^react-native$': '<rootDir>/../../../jest/react-native.mock.js',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../../coverage/libs/shared/data-store',
};
