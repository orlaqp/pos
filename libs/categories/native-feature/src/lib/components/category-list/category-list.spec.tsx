import React from 'react';
import { render } from '@testing-library/react-native';

import CategoryItem from '../category-item/category-item';
import CategoryList, { buildCategoryListProps } from './category-list';

describe('CategoryList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render successfully', () => {
        const { container } = render(<CategoryList navigation={{} as any} />);
        expect(container).toBeTruthy();
    });

    it('builds item-list props for category flow', () => {
        const navigation: any = { navigate: jest.fn() };
        const props = buildCategoryListProps(navigation);

        expect(props).toEqual(
            expect.objectContaining({
                ItemComponent: CategoryItem,
                formNavName: 'Category Form',
                navigation,
            })
        );
        expect(props.fetchItemsAction).toBeDefined();
        expect(props.filterAction).toBeDefined();
    });

});
