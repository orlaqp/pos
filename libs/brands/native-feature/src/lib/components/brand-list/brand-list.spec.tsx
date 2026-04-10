import React from 'react';
import { render } from '@testing-library/react-native';

import BrandItem from '../brand-item/brand-item';
import BrandList, { buildBrandListProps } from './brand-list';

jest.mock('@pos/shared/ui-native', () => ({
    UIGenericItemList: () => null,
}));

jest.mock('@react-navigation/native', () => ({
    useFocusEffect: (callback: () => void | (() => void)) => {
        const ReactLocal = require('react');
        ReactLocal.useEffect(() => callback(), [callback]);
    },
}));

describe('BrandList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render successfully', () => {
        expect(() => render(<BrandList navigation={{} as any} />)).not.toThrow();
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
