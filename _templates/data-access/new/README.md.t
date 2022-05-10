---
to: <%= h.daLib(name) %>/README.md
---
<%
plural = h.plural(name)
%>
# <%= plural %>-data-access

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test <%= plural %>-data-access` to execute the unit tests via [Jest](https://jestjs.io).
