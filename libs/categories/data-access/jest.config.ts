/* eslint-disable */
export default {
    displayName: 'categories-data-access',
    preset: '../../../jest.preset.js',
    transform: {
        '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json', isolatedModules: true, diagnostics: false }],
    },
    moduleNameMapper: {
        '^react-native$': '<rootDir>/../../../jest/react-native.mock.js',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../../coverage/libs/categories/data-access',
};
