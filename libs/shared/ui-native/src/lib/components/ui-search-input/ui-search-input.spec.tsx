import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { UISearchInput } from './ui-search-input';

jest.mock('@rneui/themed', () => ({
    useTheme: () => ({
        theme: {
            colors: {
                grey5: '#2f3742',
                grey2: '#8f9baa',
                grey1: '#ffffff',
            },
        },
    }),
    Input: ({
        rightIcon,
        onSubmitEditing,
        onChangeText,
        value,
        testID,
        blurOnSubmit,
    }: {
        rightIcon?: { onPress?: () => void };
        onSubmitEditing?: (event: { nativeEvent: { text: string } }) => void;
        onChangeText?: (text: string) => void;
        value?: string;
        testID?: string;
        blurOnSubmit?: boolean;
    }) => {
        const { Pressable, TextInput } = require('react-native');

        return (
            <>
                <TextInput
                    testID={testID || 'ui-search-input'}
                    value={value}
                    onChangeText={onChangeText}
                    onSubmitEditing={onSubmitEditing}
                    blurOnSubmit={blurOnSubmit}
                />
                <Pressable testID="ui-search-clear-button" onPress={rightIcon?.onPress} />
            </>
        );
    },
}));

describe('UiSearchInput', () => {
    beforeEach(() => {
        jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
            callback(0);
            return 0;
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should render successfully', () => {
        const { toJSON } = render(<UISearchInput onSubmit={jest.fn()} />);
        expect(toJSON()).toBeTruthy();
    });

    it('submits the current text on enter', () => {
        const onSubmit = jest.fn();
        const { getByTestId } = render(<UISearchInput onSubmit={onSubmit} />);

        expect(getByTestId('ui-search-input').props.blurOnSubmit).toBe(false);
        fireEvent.changeText(getByTestId('ui-search-input'), '123456');
        fireEvent(getByTestId('ui-search-input'), 'submitEditing', {
            nativeEvent: { text: '123456' },
        });

        expect(onSubmit).toHaveBeenCalledWith('123456');
    });

    it('clears and restores focus on submit when configured', () => {
        const onSubmit = jest.fn();
        const onChangeText = jest.fn();
        const focus = jest.fn();
        const clear = jest.fn();
        const ref = React.createRef<any>();
        const { getByTestId } = render(
            <UISearchInput
                ref={ref}
                onSubmit={onSubmit}
                onChangeText={onChangeText}
                clearOnSubmit={true}
                retainFocusOnSubmit={true}
            />
        );

        ref.current = { focus, clear };
        fireEvent.changeText(getByTestId('ui-search-input'), 'apple');
        fireEvent(getByTestId('ui-search-input'), 'submitEditing', {
            nativeEvent: { text: 'apple' },
        });

        expect(onSubmit).toHaveBeenCalledWith('apple');
        expect(onChangeText).toHaveBeenCalledWith('');
        expect(clear).toHaveBeenCalled();
        expect(focus).toHaveBeenCalled();
    });

    it('clears the current text and notifies submit listeners', () => {
        const onSubmit = jest.fn();
        const onChangeText = jest.fn();
        const onClear = jest.fn();
        const { getByTestId } = render(
            <UISearchInput onSubmit={onSubmit} onChangeText={onChangeText} onClear={onClear} />
        );

        fireEvent.changeText(getByTestId('ui-search-input'), 'apple');
        fireEvent.press(getByTestId('ui-search-clear-button'));

        expect(onChangeText).toHaveBeenCalledWith('');
        expect(onSubmit).toHaveBeenCalledWith('');
        expect(onClear).toHaveBeenCalled();
    });
});
