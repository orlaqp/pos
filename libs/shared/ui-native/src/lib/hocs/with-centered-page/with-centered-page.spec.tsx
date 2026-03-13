import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { withCenteredPage } from './with-centered-page';

describe('WithPage', () => {
    it('should render successfully', () => {
        const Wrapped = withCenteredPage(() => <Text>content</Text>);
        const { getByText } = render(<Wrapped />);
        expect(getByText('content')).toBeTruthy();
    });
});
