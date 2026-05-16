export default {
    displayName: 'admin-web',
    preset: '../../jest.preset.js',
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../coverage/apps/admin-web',
};
