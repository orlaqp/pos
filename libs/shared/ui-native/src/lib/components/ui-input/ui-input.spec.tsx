import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { FormProvider, useForm } from 'react-hook-form';
import { TextInput, View } from 'react-native';

jest.mock('@pos/theme/native', () => ({
    useSharedStyles: () => ({
        inputContainerStyle: {
            backgroundColor: '#2f3742',
            borderWidth: 0,
        },
        inputStyle: {
            color: '#ffffff',
        },
    }),
}));

jest.mock('@rneui/themed', () => ({
    useTheme: () => ({
        theme: {
            colors: {
                primary: '#4aa3eb',
                grey2: '#8f9baa',
            },
        },
    }),
    Input: ({
        value,
        onFocus,
        onBlur,
        onChangeText,
        inputContainerStyle,
    }: {
        value?: string;
        onFocus?: () => void;
        onBlur?: () => void;
        onChangeText?: (text: string) => void;
        inputContainerStyle?: unknown;
    }) => (
        <View testID="ui-input-container" style={inputContainerStyle}>
            <TextInput
                testID="ui-input-control"
                value={value}
                onFocus={onFocus}
                onBlur={onBlur}
                onChangeText={onChangeText}
            />
        </View>
    ),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { UIInput } = require('./ui-input');

function Wrapper({ children }: { children: React.ReactNode }) {
    const form = useForm<{ firstName: string }>({
        defaultValues: {
            firstName: '',
        },
    });

    return <FormProvider {...form}>{children}</FormProvider>;
}

describe('UIInput', () => {
    it('renders and updates value', () => {
        const { getByTestId } = render(
            <Wrapper>
                <UIInput name="firstName" placeholder="First name" />
            </Wrapper>
        );

        const control = getByTestId('ui-input-control');
        fireEvent.changeText(control, 'Ada');
        expect(control.props.value).toBe('Ada');
    });

    it('applies focus border and removes it on blur', () => {
        const { getByTestId } = render(
            <Wrapper>
                <UIInput name="firstName" placeholder="First name" />
            </Wrapper>
        );

        const control = getByTestId('ui-input-control');
        const container = getByTestId('ui-input-container');

        fireEvent(control, 'focus');
        const focusedStyle = Array.isArray(container.props.style)
            ? Object.assign({}, ...container.props.style.filter(Boolean))
            : container.props.style;
        expect(focusedStyle.borderWidth).toBe(1);
        expect(focusedStyle.borderColor).toBe('#4aa3eb');

        fireEvent(control, 'blur');
        const blurredStyle = Array.isArray(container.props.style)
            ? Object.assign({}, ...container.props.style.filter(Boolean))
            : container.props.style;
        expect(blurredStyle.borderWidth).toBe(0);
    });
});
