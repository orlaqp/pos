import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { withHorizontallyCenteredPage } from './with-horizontally-centered-page';

describe('WithPage', () => {
    it('should render successfully', () => {
        const Wrapped = withHorizontallyCenteredPage(() => <Text>content</Text>);
        const { getByText } = render(<Wrapped />);
        expect(getByText('content')).toBeTruthy();
    });
});
