import React from 'react';
import { render } from '@testing-library/react-native';

import UnitOfMeasureItem from '../unit-of-measure-item/unit-of-measure-item';
import UnitOfMeasureList, {
    buildUnitOfMeasureListProps,
} from './unit-of-measure-list';

describe('UnitOfMeasureList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render successfully', () => {
        const { container } = render(<UnitOfMeasureList navigation={{} as any} />);
        expect(container).toBeTruthy();
    });

    it('builds item-list props for unit-of-measure flow', () => {
        const navigation: any = { navigate: jest.fn() };
        const props = buildUnitOfMeasureListProps(navigation);

        expect(props).toEqual(
            expect.objectContaining({
                ItemComponent: UnitOfMeasureItem,
                formNavName: 'UnitOfMeasure Form',
                navigation,
            })
        );
        expect(props.fetchItemsAction).toBeDefined();
        expect(props.filterAction).toBeDefined();
    });

});
