import React from 'react';
import { render } from '@testing-library/react-native';
import { FormProvider, useForm } from 'react-hook-form';
import * as mockReactNative from 'react-native';
import { UINumericInput } from './ui-numeric-input';

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
                error: '#ff5a67',
            },
        },
    }),
    Input: ({
        value,
        inputContainerStyle,
        inputStyle,
    }: {
        value?: string;
        inputContainerStyle?: unknown;
        inputStyle?: unknown;
    }) => (
        <mockReactNative.View
            testID="ui-numeric-input-container"
            style={inputContainerStyle}
        >
            <mockReactNative.TextInput
                testID="ui-numeric-input-control"
                value={value}
                style={inputStyle}
            />
        </mockReactNative.View>
    ),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
    const form = useForm<{ amount: number }>({
        defaultValues: {
            amount: 10,
        },
    });

    return <FormProvider {...form}>{children}</FormProvider>;
}

describe('UINumericInput', () => {
    it('forwards caller input container and text styles', () => {
        const { getByTestId } = render(
            <Wrapper>
                <UINumericInput
                    name="amount"
                    inputContainerStyle={{
                        minHeight: 30,
                        borderRadius: 10,
                    }}
                    inputStyle={{
                        fontSize: 13,
                    }}
                />
            </Wrapper>
        );

        const containerStyle = Object.assign(
            {},
            ...getByTestId('ui-numeric-input-container').props.style.filter(
                Boolean,
            ),
        );
        const inputStyle = Object.assign(
            {},
            ...getByTestId('ui-numeric-input-control').props.style.filter(
                Boolean,
            ),
        );

        expect(containerStyle).toMatchObject({
            minHeight: 30,
            borderRadius: 10,
        });
        expect(inputStyle).toMatchObject({
            fontSize: 13,
        });
    });
});
