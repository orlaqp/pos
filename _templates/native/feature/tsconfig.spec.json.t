---
to: <%= h.lib(name) %>/tsconfig.spec.json
---
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "types": ["jest", "node"]
  },
  "include": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/*.test.tsx",
    "**/*.spec.tsx",
    "**/*.test.js",
    "**/*.spec.js",
    "**/*.test.jsx",
    "**/*.spec.jsx",
    "**/*.d.ts"
  ]
}
