import { useSharedStyles } from '@pos/theme/native';
import { InputProps } from '@rneui/base';
import { Input, useTheme } from '@rneui/themed';
import React, { useState } from 'react';
import { useFormContext, Controller, RegisterOptions } from 'react-hook-form';
import { TextInput } from 'react-native';

type Props = React.ComponentProps<typeof Input> & {
    name: string;
    placeholder: string;
    rules?: RegisterOptions;
    validationLength?: number;
    lIcon?: string;
    rIcon?: string;
    formatter?: (oldValue: string, newValue: string) => string;
    onValid?: () => void;
};

export const UIInput = React.forwardRef<TextInput, Props>((props, ref) => {
    const theme = useTheme();
    const styles = useSharedStyles();
    const { name, rules, formatter, onValid, lIcon, rIcon, textAlign, ...restOfProps } =
        props;
    const { control } = useFormContext();
    const [focused, setFocused] = useState(false);

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

    //   const value = watch(name)

    //   useEffect(() => {
    //     async function validate() {
    //       const isValid = await trigger(name)
    //       if (isValid) onValid?.()
    //     }

    //     if (value?.length >= validationLength) {
    //       validate()
    //     }
    //   }, [value, name, validationLength, trigger]) // eslint-disable-line react-hooks/exhaustive-deps

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
                    textAlign={textAlign || 'left'}
                    placeholder={props.placeholder}
                    value={value}
                    onBlur={(event) => {
                        setFocused(false);
                        onBlur();
                        props.onBlur?.(event);
                    }}
                    onFocus={(event) => {
                        setFocused(true);
                        props.onFocus?.(event);
                    }}
                    onChangeText={onChange}
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
            rules={rules}
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
});
