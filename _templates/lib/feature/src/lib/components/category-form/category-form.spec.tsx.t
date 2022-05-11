---
to: <%= h.components(name) %>/<%= h.paramCase(name) %>-form/<%= h.paramCase(name) %>-form.spec.tsx
---
<%
paramCase = h.paramCase(name)
singularCapitalized = h.singularCapitalized(name)
%>
import React from 'react';
import { render } from '@testing-library/react-native';

import <%= singularCapitalized %>Form from './<%= paramCase %>-form';

describe('<%= singularCapitalized %>Form', () => {
  it('should render successfully', () => {
    const { container } = render(< <%= singularCapitalized %>Form />);
    expect(container).toBeTruthy();
  });
});
