---
to: <%= h.components(name) %>/<%= h.pluralParamCase(name) %>/<%= h.pluralParamCase(name) %>.spec.tsx
---
<%
pluralParamCase = h.pluralParamCase(name)
pluralCapitalized = h.pluralCapitalized(name)
%>
import React from 'react';
import { render } from '@testing-library/react-native';

import <%= pluralCapitalized %> from './<%= pluralParamCase %>';

describe('<%= pluralCapitalized %>', () => {
  it('should render successfully', () => {
    const { container } = render(< <%= pluralCapitalized %> />);
    expect(container).toBeTruthy();
  });
});
