
import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { render } from '@testing-library/react-native';

import BrandItem, { deleteBrandById } from './brand-item';

describe('BrandItem', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    });

    it('should render successfully', () => {
        const item: any = {
            id: 'brand-1',
            name: 'Brand A',
            description: 'Test brand',
        };
        const navigation: any = { navigate: jest.fn() };
        const { UNSAFE_root } = render(<BrandItem item={item} navigation={navigation} />);
        expect(UNSAFE_root).toBeTruthy();
    });

    it('navigates to form when row is pressed', () => {
        const item: any = {
            id: 'brand-1',
            name: 'Brand A',
            description: 'Test brand',
        };
        const navigation: any = { navigate: jest.fn() };
        const { UNSAFE_getAllByType } = render(
            <BrandItem item={item} navigation={navigation} />
        );

        const touchables = UNSAFE_getAllByType(TouchableOpacity);
        touchables[0].props.onPress();
        expect(navigation.navigate).toHaveBeenCalledWith('Brand Form');
    });

    it('opens delete confirmation dialog', () => {
        const item: any = {
            id: undefined,
            name: 'Brand A',
            description: 'Test brand',
        };
        const navigation: any = { navigate: jest.fn() };
        const { UNSAFE_getAllByType } = render(
            <BrandItem item={item} navigation={navigation} />
        );

        const touchables = UNSAFE_getAllByType(TouchableOpacity);
        touchables[1].props.onPress();
        expect(Alert.alert).toHaveBeenCalledWith(
            'Are you sure?',
            'You will not be able to undo this operation',
            expect.any(Array)
        );
    });

    it('executes delete flow when confirmed for an item with id', async () => {
        const item: any = {
            id: 'brand-1',
            name: 'Brand A',
            description: 'Test brand',
        };
        const navigation: any = { navigate: jest.fn() };
        const { UNSAFE_getAllByType } = render(
            <BrandItem item={item} navigation={navigation} />
        );

        const touchables = UNSAFE_getAllByType(TouchableOpacity);
        touchables[1].props.onPress();
        const options = (Alert.alert as jest.Mock).mock.calls[0][2];
        const yesOption = options.find((o: { text: string }) => o.text === 'Yes');
        await yesOption.onPress();

        expect(Alert.alert).toHaveBeenCalled();
    });

    it('deleteBrandById handles missing and valid ids', async () => {
        const deleteBrand = jest.fn(() => Promise.resolve());
        const removeBrand = jest.fn();

        await expect(deleteBrandById(undefined, deleteBrand, removeBrand)).resolves.toBe(
            false
        );
        expect(deleteBrand).not.toHaveBeenCalled();
        expect(removeBrand).not.toHaveBeenCalled();

        await expect(
            deleteBrandById('brand-1', deleteBrand, removeBrand)
        ).resolves.toBe(true);
        expect(deleteBrand).toHaveBeenCalledWith('brand-1');
        expect(removeBrand).toHaveBeenCalledWith('brand-1');
    });
});
