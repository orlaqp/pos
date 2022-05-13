import { InputProps } from '@rneui/base';
import { Input, useTheme } from '@rneui/themed';
import React from 'react';
import { useFormContext, Controller, RegisterOptions } from 'react-hook-form';
import { TextInput } from 'react-native';

type Props = React.ComponentProps<typeof TextInput> & {
    name: string;
    allowDecimals?: boolean;
    rules?: RegisterOptions;
    lIcon?: string;
    rIcon?: string;
};

export const UINumericInput = React.forwardRef<TextInput, Props>(
    (props, ref) => {
        const theme = useTheme();
        const { name, allowDecimals, rules, lIcon, rIcon, ...restOfProps } =
            props;
        const { control } = useFormContext();

        const inputProps = restOfProps as InputProps;
        inputProps.leftIcon = lIcon
            ? {
                  name: lIcon,
                  type: 'material-community',
                  color: theme.theme.colors.grey2,
              }
            : undefined;
        inputProps.rightIcon = rIcon
            ? {
                  name: rIcon,
                  type: 'material-community',
                  color: theme.theme.colors.grey2,
              }
            : undefined;

        const mergedRules = {
            ...rules,
            pattern: {
                value: allowDecimals
                    ? /^([0-9]+\.?[0-9]*|\.[0-9]+)$/
                    : /^([0-9]+)$/,
                message: allowDecimals
                    ? 'Only decimal values are allowed here'
                    : 'Only integers are allowed here',
            },
        };

        return (
            <Controller
                control={control}
                name={name}
                render={({
                    field: { onChange, value, onBlur, ref },
                    fieldState: { isTouched, isDirty, error },
                }) => (
                    <Input
                        ref={ref}
                        {...restOfProps}
                        placeholder={props.placeholder}
                        value={value?.toString()}
                        onBlur={onBlur}
                        onChangeText={(text) => onChange(+text)}
                        errorMessage={error?.message}
                    />
                )}
                rules={mergedRules}
            />

            // <Controller
            //   control={control}
            //   render={({
            //       field: { onChange, onBlur, value, name, ref },
            //       fieldState: { invalid, isTouched, isDirty, error },
            //     formState,
            //   }) => (
            //     <Input
            //       {...restOfProps}
            //       ref={ref}
            //       testID={`TextField.${name}`}
            //       errorMessage={error?.message}
            //       onBlur={(event) => {
            //           debugger;
            //         onBlur()
            //       }}
            //       onChangeText={(text) => {
            //           debugger;
            //         const formatted = formatter ? formatter(value, text) : text
            //         onChange(formatted)
            //       }}
            //       value={value}
            //     />
            //   )}
            //   name={name}
            //   rules={rules}
            // />
        );
    }
);
