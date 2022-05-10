---
to: <%= h.components(name) %>/<%= name %>-list/<%= name %>-list.spec.tsx
---
<%
plural = h.inflection.pluralize(name)
singularCapitalized = h.singularCapitalized(name)
%>
import React from 'react';
import { render } from '@testing-library/react-native';

import <%= singularCapitalized %>List from './<%= name %>-list';

describe('<%= singularCapitalized %>List', () => {
  it('should render successfully', () => {
    const { container } = render(<<%= singularCapitalized %>List />);
    expect(container).toBeTruthy();
  });
});
