---
to: <%= h.daLib(name) %>/jest.config.js
---
<%
plural = h.plural(name)
%>
module.exports = {
  displayName: '<%= plural %>-data-access',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/<%= plural %>/data-access',
};
