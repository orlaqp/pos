import React from 'react';
import { render } from '@testing-library/react-native';

import ListWidget from './list-widget';

describe('ListWidget', () => {
    it('should render successfully', () => {
        const { container } = render(
            <ListWidget header="Top Items" items={[{ name: 'Item 1', value: '$10.00' }]} />
        );
        expect(container).toBeTruthy();
    });
});
