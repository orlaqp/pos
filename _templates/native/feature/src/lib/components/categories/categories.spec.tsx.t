---
to: <%= h.components(name) %>/<%= h.plural(name) %>/<%= h.plural(name) %>.spec.tsx
---
<%
plural = h.inflection.pluralize(name)
pluralCapitalized = h.pluralCapitalized(name)
%>
import React from 'react';
import { render } from '@testing-library/react-native';

import <%= pluralCapitalized %> from './<%= plural %>';

describe('<%= pluralCapitalized %>', () => {
  it('should render successfully', () => {
    const { container } = render(< <%= pluralCapitalized %> />);
    expect(container).toBeTruthy();
  });
});
