---
to: <%= h.components(name) %>/<%= name %>-item/<%= name %>-item.spec.tsx
---
<%
plural = h.inflection.pluralize(name)
singularCapitalized = h.singularCapitalized(name)
%>
import React from 'react';
import { render } from '@testing-library/react-native';

import <%= singularCapitalized %>Item from './<%= name %>-item';

describe('<%= singularCapitalized %>Item', () => {
    it('should render successfully', () => {
        const { container } = render(<<%= singularCapitalized %>Item />);
        expect(container).toBeTruthy();
    });
});
