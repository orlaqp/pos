import React from 'react';
import { render } from '@testing-library/react-native';

import ProductItem from '../product-item/product-item';
import ProductList, { buildProductListProps } from './product-list';

describe('ProductList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render successfully', () => {
        const { container } = render(<ProductList navigation={{} as any} />);
        expect(container).toBeTruthy();
    });

    it('builds item-list props for product flow', () => {
        const navigation: any = { navigate: jest.fn() };
        const props = buildProductListProps(navigation);

        expect(props).toEqual(
            expect.objectContaining({
                ItemComponent: ProductItem,
                formNavName: 'Product Form',
                navigation,
            })
        );
        expect(props.fetchItemsAction).toBeDefined();
        expect(props.filterAction).toBeDefined();
    });

});
