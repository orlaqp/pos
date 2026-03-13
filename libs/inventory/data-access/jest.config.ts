/* eslint-disable */

export default {
    displayName: 'inventory-data-access',
    preset: '../../../jest.preset.js',
    transform: {
        '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json', isolatedModules: true, diagnostics: false }],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../../coverage/libs/inventory/data-access',
};
