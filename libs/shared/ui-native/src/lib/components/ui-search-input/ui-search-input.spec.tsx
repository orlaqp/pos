import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { UISearchInput } from './ui-search-input';

const mockFocus = jest.fn();

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
    Input: require('react').forwardRef(
        (
            props: {
                rightIcon?: { onPress?: () => void };
                onSubmitEditing?: (event: { nativeEvent: { text: string } }) => void;
                onChangeText?: (text: string) => void;
                value?: string;
                testID?: string;
                blurOnSubmit?: boolean;
                autoFocus?: boolean;
                onBlur?: () => void;
            },
            ref: React.ForwardedRef<{ focus: () => void }>
        ) => {
            const { Pressable, TextInput } = require('react-native');

            if (typeof ref === 'function') {
                ref({ focus: mockFocus });
            } else if (ref) {
                ref.current = { focus: mockFocus };
            }

            return (
                <>
                    <TextInput
                        testID={props.testID || 'ui-search-input'}
                        value={props.value}
                        onChangeText={props.onChangeText}
                        onSubmitEditing={props.onSubmitEditing}
                        blurOnSubmit={props.blurOnSubmit}
                        autoFocus={props.autoFocus}
                        onBlur={props.onBlur}
                    />
                    <Pressable
                        testID="ui-search-clear-button"
                        onPress={props.rightIcon?.onPress}
                    />
                </>
            );
        }
    ),
}));

describe('UiSearchInput', () => {
    beforeEach(() => {
        mockFocus.mockClear();
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

    it('allows callers to disable auto focus', () => {
        const { getByTestId } = render(
            <UISearchInput onSubmit={jest.fn()} autoFocus={false} />
        );

        expect(getByTestId('ui-search-input').props.autoFocus).toBe(false);
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

    it('can clear text and retain focus after submit', () => {
        const onSubmit = jest.fn();
        const onChangeText = jest.fn();
        const { getByTestId } = render(
            <UISearchInput
                onSubmit={onSubmit}
                onChangeText={onChangeText}
                clearOnSubmit={true}
                retainFocusOnSubmit={true}
            />
        );

        fireEvent.changeText(getByTestId('ui-search-input'), 'banana');
        fireEvent(getByTestId('ui-search-input'), 'submitEditing', {
            nativeEvent: { text: 'banana' },
        });

        expect(onSubmit).toHaveBeenCalledWith('banana');
        expect(onChangeText).toHaveBeenCalledWith('');
        expect(mockFocus).toHaveBeenCalled();
    });

    it('can regain focus after blur when configured', () => {
        jest.useFakeTimers();
        const { getByTestId } = render(
            <UISearchInput onSubmit={jest.fn()} retainFocusOnBlur={true} />
        );

        fireEvent(getByTestId('ui-search-input'), 'blur');
        jest.runAllTimers();

        expect(mockFocus).toHaveBeenCalled();
        jest.useRealTimers();
    });
});
