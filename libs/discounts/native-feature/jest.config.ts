export default {
  displayName: 'discounts-native-feature',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json', diagnostics: false }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/../../../jest/react-native.mock.js',
  },
  coverageDirectory: '../../../coverage/libs/discounts/native-feature',
};
