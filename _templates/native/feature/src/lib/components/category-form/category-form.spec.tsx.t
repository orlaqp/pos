---
to: <%= h.components(name) %>/<%= name %>-form/<%= name %>-form.spec.tsx
---
<%
plural = h.inflection.pluralize(name)
singularCapitalized = h.singularCapitalized(name)
%>
import React from 'react';
import { render } from '@testing-library/react-native';

import <%= singularCapitalized %>Form from './<%= name %>-form';

describe('<%= singularCapitalized %>Form', () => {
  it('should render successfully', () => {
    const { container } = render(< <%= singularCapitalized %>Form />);
    expect(container).toBeTruthy();
  });
});
