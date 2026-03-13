
import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { render } from '@testing-library/react-native';

import UnitOfMeasureItem from './unit-of-measure-item';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: () => jest.fn(),
}));

describe('UnitOfMeasureItem', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    });

    it('should render successfully', () => {
        const item: any = {
            id: 'uom-1',
            name: 'ea',
            description: 'Each',
        };
        const navigation: any = { navigate: jest.fn() };
        const { container } = render(
            <UnitOfMeasureItem item={item} navigation={navigation} />
        );
        expect(container).toBeTruthy();
    });

    it('blocks editing the default ea item', () => {
        const item: any = {
            id: 'uom-1',
            name: 'ea',
            description: 'Each',
        };
        const navigation: any = { navigate: jest.fn() };
        const { UNSAFE_getByType } = render(
            <UnitOfMeasureItem item={item} navigation={navigation} />
        );

        UNSAFE_getByType(TouchableOpacity).props.onPress();
        expect(Alert.alert).toHaveBeenCalledWith('This item cannot be changed');
        expect(navigation.navigate).not.toHaveBeenCalled();
    });

    it('navigates to form for editable units', () => {
        const item: any = {
            id: 'uom-2',
            name: 'box',
            description: 'Box',
        };
        const navigation: any = { navigate: jest.fn() };
        const { UNSAFE_getByType } = render(
            <UnitOfMeasureItem item={item} navigation={navigation} />
        );

        UNSAFE_getByType(TouchableOpacity).props.onPress();
        expect(navigation.navigate).toHaveBeenCalledWith('UnitOfMeasure Form');
    });
});
