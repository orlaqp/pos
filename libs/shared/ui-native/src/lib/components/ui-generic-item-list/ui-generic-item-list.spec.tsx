import React from 'react';
import { render } from '@testing-library/react-native';

import GenericItemList from './ui-generic-item-list';

describe('GenericItemList', () => {
    it('should render successfully', () => {
        // const { container } = render(<GenericItemList />);
        expect(container).toBeTruthy();
    });
});
