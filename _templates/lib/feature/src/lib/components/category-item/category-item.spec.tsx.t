---
to: <%= h.components(name) %>/<%= h.paramCase(name) %>-item/<%= h.paramCase(name) %>-item.spec.tsx
---
<%
paramCase = h.paramCase(name)
singularCapitalized = h.singularCapitalized(name)
%>
import React from 'react';
import { render } from '@testing-library/react-native';

import <%= singularCapitalized %>Item from './<%= paramCase %>-item';

describe('<%= singularCapitalized %>Item', () => {
    it('should render successfully', () => {
        const { container } = render(<<%= singularCapitalized %>Item />);
        expect(container).toBeTruthy();
    });
});
