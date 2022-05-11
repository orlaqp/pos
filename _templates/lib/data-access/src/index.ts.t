---
to: <%= h.daLib(name) %>/src/index.ts
---
export * from './lib/slices/<%= h.pluralParamCase(name) %>.slice';
export * from './lib/<%= h.paramCase(name) %>.entity';
export * from './lib/<%= h.paramCase(name) %>.service';
