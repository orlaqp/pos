---
to: <%= h.lib(name) %>/project.json
---
<%
pluralParamCase = h.pluralParamCase(name)
%>
{
  "root": "libs/<%= pluralParamCase %>/native",
  "sourceRoot": "libs/<%= pluralParamCase %>/native/src",
  "projectType": "library",
  "tags": [],
  "targets": {
    "lint": {
      "executor": "@nrwl/linter:eslint",
      "outputs": ["{options.outputFile}"],
      "options": {
        "lintFilePatterns": [
          "libs/<%= pluralParamCase %>/native/**/*.{ts,tsx,js,jsx}"
        ]
      }
    },
    "test": {
      "executor": "@nrwl/jest:jest",
      "outputs": ["coverage/libs/<%= pluralParamCase %>/native"],
      "options": {
        "jestConfig": "libs/<%= pluralParamCase %>/native/jest.config.js",
        "passWithNoTests": true
      }
    }
  }
}
