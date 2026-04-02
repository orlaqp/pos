import { useSharedStyles } from '@pos/theme/native';
import { InputProps } from '@rneui/base';
import { Input, useTheme } from '@rneui/themed';
import React, { useState } from 'react';
import { useFormContext, Controller, RegisterOptions } from 'react-hook-form';

type Props = InputProps & {
    name: string;
    allowDecimals?: boolean;
    rules?: RegisterOptions;
    lIcon?: string;
    rIcon?: string;
};

export const UINumericInput = React.forwardRef<any, Props>(
    (props, ref) => {
        const theme = useTheme();
        const styles = useSharedStyles();
        const [focused, setFocused] = useState(false);
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
            : inputProps.leftIcon;
        inputProps.rightIcon = rIcon
            ? {
                  name: rIcon,
                  type: 'material-community',
                  color: theme.theme.colors.grey2,
              }
            : inputProps.rightIcon;

        const mergedRules = {
            ...rules,
            pattern:
                rules?.pattern || {
                    value: allowDecimals
                        ? /^(?:0\.(?:0[0-9]|[0-9]\d?)|[0-9]\d*(?:\.\d{1,2})?)(?:e[+-]?\d+)?$/
                        : /^([0-9]+)$/,
                    message: allowDecimals
                        ? 'Only numbers are allowed here'
                        : 'Only integers are allowed here',
                },
        };

        // const validate = (value: string) => {
        //     debugger;
        //     const matches = value.match(
        //         /^(?:0\.(?:0[0-9]|[0-9]\d?)|[0-9]\d*(?:\.\d{1,2})?)(?:e[+-]?\d+)?$/
        //     );
        //     return matches && matches?.length > 0 || 'Not a Number';
        // };

        return (
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, value, onBlur, ref }, fieldState: { error } }) => (
                    <Input
                        ref={ref as any}
                        {...restOfProps}
                        placeholder={props.placeholder}
                        value={value?.toString()}
                        onBlur={(event) => {
                            setFocused(false);
                            onBlur();
                            props.onBlur?.(event);
                        }}
                        onFocus={(event) => {
                            setFocused(true);
                            props.onFocus?.(event);
                        }}
                        onChange={onChange}
                        onChangeText={(text) => {
                            onChange(text);
                            if (props.onChangeText) props.onChangeText(text); 
                        }}
                        // onChangeText={(text)=>onChange(validate(text))}
                        errorMessage={error?.message}
                        inputContainerStyle={[
                            styles.inputContainerStyle,
                            focused
                                ? {
                                      borderWidth: 1,
                                      borderColor: theme.theme.colors.primary,
                                  }
                                : undefined,
                        ]}
                        inputStyle={styles.inputStyle}
                    />
                )}
                rules={mergedRules}
                // rules={{ validate }}
            />
        );
    }
);
