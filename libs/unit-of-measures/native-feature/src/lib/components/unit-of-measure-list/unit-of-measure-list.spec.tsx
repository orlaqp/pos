import React from 'react';
import { render } from '@testing-library/react-native';

import UnitOfMeasureItem from '../unit-of-measure-item/unit-of-measure-item';
import UnitOfMeasureList, {
    buildUnitOfMeasureListProps,
} from './unit-of-measure-list';

jest.mock('@pos/shared/ui-native', () => ({
    UIGenericItemList: () => null,
}));

jest.mock('@react-navigation/native', () => ({
    useFocusEffect: (callback: () => void | (() => void)) => {
        const ReactLocal = require('react');
        ReactLocal.useEffect(() => callback(), [callback]);
    },
}));

describe('UnitOfMeasureList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render successfully', () => {
        expect(() => render(<UnitOfMeasureList navigation={{} as any} />)).not.toThrow();
    });

    it('builds item-list props for unit-of-measure flow', () => {
        const navigation: any = { navigate: jest.fn() };
        const props = buildUnitOfMeasureListProps(navigation);

        expect(props).toEqual(
            expect.objectContaining({
                ItemComponent: UnitOfMeasureItem,
                formNavName: 'UnitOfMeasure Form',
                navigation,
                fetchItemsAction: undefined,
            })
        );
        expect(props.filterAction).toBeDefined();
    });

});
