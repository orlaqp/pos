/* eslint-disable */
export default {
    displayName: 'sales-data-access',
    preset: '../../../jest.preset.js',
    transform: {
        '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json', diagnostics: false }],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../../coverage/libs/sales/data-access',
    coverageThreshold: {
        global: {
            statements: 95,
            branches: 70,
            functions: 95,
            lines: 95,
        },
    },
};
