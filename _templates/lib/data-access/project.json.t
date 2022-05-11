---
to: <%= h.daLib(name) %>/project.json
---
<%
pluralParamCase = h.pluralParamCase(name)
%>
{
  "root": "libs/<%= pluralParamCase %>/data-access",
  "sourceRoot": "libs/<%= pluralParamCase %>/data-access/src",
  "projectType": "library",
  "tags": [],
  "targets": {
    "lint": {
      "executor": "@nrwl/linter:eslint",
      "outputs": ["{options.outputFile}"],
      "options": {
        "lintFilePatterns": ["libs/<%= pluralParamCase %>/data-access/**/*.{ts,tsx,js,jsx}"]
      }
    },
    "test": {
      "executor": "@nrwl/jest:jest",
      "outputs": ["coverage/libs/<%= pluralParamCase %>/data-access"],
      "options": {
        "jestConfig": "libs/<%= pluralParamCase %>/data-access/jest.config.js",
        "passWithNoTests": true
      }
    }
  }
}
