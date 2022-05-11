---
to: <%= h.lib(name) %>/src/index.ts
---
export * from './lib/components/<%= h.paramCase(name) %>-form/<%= h.paramCase(name) %>-form';
export * from './lib/components/<%= h.pluralParamCase(name) %>/<%= h.pluralParamCase(name) %>';