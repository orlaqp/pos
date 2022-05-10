---
to: <%= h.lib(name) %>/src/index.ts
---
<%
plural = h.plural(name)
%>
export * from './lib/components/<%= h.lower(name) %>-selection/<%= h.lower(name) %>-selection';
export * from './lib/components/<%= h.lower(name) %>-form/<%= h.lower(name) %>-form';
export * from './lib/components/<%= plural %>/<%= plural %>';