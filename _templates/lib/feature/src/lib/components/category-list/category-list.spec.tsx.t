---
to: <%= h.components(name) %>/<%= h.paramCase(name) %>-list/<%= h.paramCase(name) %>-list.spec.tsx
---
<%
paramCase = h.paramCase(name)
singularCapitalized = h.singularCapitalized(name)
%>
import React from 'react';
import { render } from '@testing-library/react-native';

import <%= singularCapitalized %>List from './<%= paramCase %>-list';

describe('<%= singularCapitalized %>List', () => {
  it('should render successfully', () => {
    const { container } = render(<<%= singularCapitalized %>List />);
    expect(container).toBeTruthy();
  });
});
