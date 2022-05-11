---
to: <%= h.daLib(name) %>/jest.config.js
---
<%
pluralParamCase = h.pluralParamCase(name)
%>
module.exports = {
  displayName: '<%= pluralParamCase %>-data-access',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/<%= pluralParamCase %>/data-access',
};
