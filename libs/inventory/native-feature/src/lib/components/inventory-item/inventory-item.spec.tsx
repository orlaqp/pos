
import React from 'react';
import { render } from '@testing-library/react-native';

import InventoryItem from './inventory-item';

describe('InventoryItem', () => {
    it('should render successfully', () => {
        const { container } = render(<InventoryItem />);
        expect(container).toBeTruthy();
    });
});
