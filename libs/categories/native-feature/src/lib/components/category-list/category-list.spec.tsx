import React from 'react';
import { render } from '@testing-library/react-native';

import CategoryItem from '../category-item/category-item';
import CategoryList, { buildCategoryListProps } from './category-list';

jest.mock('@pos/shared/ui-native', () => ({
    UIGenericItemList: () => null,
}));

jest.mock('@react-navigation/native', () => ({
    useFocusEffect: (callback: () => void | (() => void)) => {
        const ReactLocal = require('react');
        ReactLocal.useEffect(() => callback(), [callback]);
    },
}));

describe('CategoryList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render successfully', () => {
        expect(() => render(<CategoryList navigation={{} as any} />)).not.toThrow();
    });

    it('builds item-list props for category flow', () => {
        const navigation: any = { navigate: jest.fn() };
        const props = buildCategoryListProps(navigation);

        expect(props).toEqual(
            expect.objectContaining({
                ItemComponent: CategoryItem,
                formNavName: 'Category Form',
                navigation,
                fetchItemsAction: undefined,
            })
        );
        expect(props.filterAction).toBeDefined();
    });

});
