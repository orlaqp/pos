import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@pos/theme/native', () => ({
    getThemeColors: () => ({
        primary: '#4aa3eb',
        grey1: '#f3f4f6',
        grey2: '#9ca3af',
        grey3: '#6b7280',
        grey4: '#374151',
        grey5: '#1f2937',
    }),
    useSharedStyles: () => ({
        page: {},
        detailsPage: {},
    }),
}));

import ProductItem from '../product-item/product-item';
import ProductList, { buildProductListProps } from './product-list';

describe('ProductList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render successfully', () => {
        const { UNSAFE_root } = render(<ProductList navigation={{} as any} />);
        expect(UNSAFE_root).toBeTruthy();
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
