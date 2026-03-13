import React from 'react';
import { render } from '@testing-library/react-native';

import BrandItem from '../brand-item/brand-item';
import BrandList, { buildBrandListProps } from './brand-list';

describe('BrandList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render successfully', () => {
        const { container } = render(<BrandList navigation={{} as any} />);
        expect(container).toBeTruthy();
    });

    it('builds item-list props for brand flow', () => {
        const navigation: any = { navigate: jest.fn() };
        const props = buildBrandListProps(navigation);

        expect(props).toEqual(
            expect.objectContaining({
                ItemComponent: BrandItem,
                formNavName: 'Brand Form',
                navigation,
                fetchItemsAction: undefined,
            })
        );
        expect(props.filterAction).toBeDefined();
    });

});
