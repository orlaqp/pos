---
to: <%= h.daLib(name) %>/project.json
---
<%
plural = h.plural(name)
%>
{
  "root": "libs/<%= plural %>/data-access",
  "sourceRoot": "libs/<%= plural %>/data-access/src",
  "projectType": "library",
  "tags": [],
  "targets": {
    "lint": {
      "executor": "@nrwl/linter:eslint",
      "outputs": ["{options.outputFile}"],
      "options": {
        "lintFilePatterns": ["libs/<%= plural %>/data-access/**/*.{ts,tsx,js,jsx}"]
      }
    },
    "test": {
      "executor": "@nrwl/jest:jest",
      "outputs": ["coverage/libs/<%= plural %>/data-access"],
      "options": {
        "jestConfig": "libs/<%= plural %>/data-access/jest.config.js",
        "passWithNoTests": true
      }
    }
  }
}
