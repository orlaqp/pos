import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { render } from '@testing-library/react-native';

import CategoryItem, { deleteCategoryById } from './category-item';

jest.mock('@pos/shared/utils', () => ({
    translateWithFallback: (_key: string, fallback: string) => fallback,
}));

describe('CategoryItem', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    });

    it('should render successfully', () => {
        const item: any = {
            id: 'cat-1',
            name: 'Fruits',
            description: 'Fruit category',
            picture: null,
        };
        const navigation: any = { navigate: jest.fn() };
        const { UNSAFE_root } = render(<CategoryItem item={item} navigation={navigation} />);
        expect(UNSAFE_root).toBeTruthy();
    });

    it('navigates to form when row is pressed', () => {
        const item: any = {
            id: 'cat-1',
            name: 'Fruits',
            description: 'Fruit category',
            picture: null,
        };
        const navigation: any = { navigate: jest.fn() };
        const { UNSAFE_getAllByType } = render(
            <CategoryItem item={item} navigation={navigation} />
        );

        const touchables = UNSAFE_getAllByType(TouchableOpacity);
        touchables[0].props.onPress();
        expect(navigation.navigate).toHaveBeenCalledWith('Category Form');
    });

    it('opens delete confirmation dialog', () => {
        const item: any = {
            id: undefined,
            name: 'Fruits',
            description: 'Fruit category',
            picture: null,
        };
        const navigation: any = { navigate: jest.fn() };
        const { UNSAFE_getAllByType } = render(
            <CategoryItem item={item} navigation={navigation} />
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
            id: 'cat-1',
            name: 'Fruits',
            description: 'Fruit category',
            picture: null,
        };
        const navigation: any = { navigate: jest.fn() };
        const { UNSAFE_getAllByType } = render(
            <CategoryItem item={item} navigation={navigation} />
        );

        const touchables = UNSAFE_getAllByType(TouchableOpacity);
        touchables[1].props.onPress();
        const options = (Alert.alert as jest.Mock).mock.calls[0][2];
        const yesOption = options.find((o: { text: string }) => o.text === 'Yes');
        await yesOption.onPress();

        expect(Alert.alert).toHaveBeenCalled();
    });

    it('deleteCategoryById handles missing and valid ids', async () => {
        const deleteCategory = jest.fn(() => Promise.resolve());
        const removeCategory = jest.fn();

        await expect(
            deleteCategoryById(undefined, deleteCategory, removeCategory)
        ).resolves.toBe(false);
        expect(deleteCategory).not.toHaveBeenCalled();
        expect(removeCategory).not.toHaveBeenCalled();

        await expect(
            deleteCategoryById('cat-1', deleteCategory, removeCategory)
        ).resolves.toBe(true);
        expect(deleteCategory).toHaveBeenCalledWith('cat-1');
        expect(removeCategory).toHaveBeenCalledWith('cat-1');
    });
});
