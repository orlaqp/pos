---
to: <%= h.lib(name) %>/project.json
---
<%
plural = h.plural(name)
%>
{
  "root": "libs/<%= plural %>/native",
  "sourceRoot": "libs/<%= plural %>/native/src",
  "projectType": "library",
  "tags": [],
  "targets": {
    "lint": {
      "executor": "@nrwl/linter:eslint",
      "outputs": ["{options.outputFile}"],
      "options": {
        "lintFilePatterns": [
          "libs/<%= plural %>/native/**/*.{ts,tsx,js,jsx}"
        ]
      }
    },
    "test": {
      "executor": "@nrwl/jest:jest",
      "outputs": ["coverage/libs/<%= plural %>/native"],
      "options": {
        "jestConfig": "libs/<%= plural %>/native/jest.config.js",
        "passWithNoTests": true
      }
    }
  }
}
