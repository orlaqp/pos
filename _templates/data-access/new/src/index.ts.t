---
to: <%= h.daLib(name) %>/src/index.ts
---
export * from './lib/slices/<%= h.plural(name) %>.slice';
export * from './lib/<%= name %>.service';
